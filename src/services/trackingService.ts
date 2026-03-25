/**
 * Tracking Service for Driver Location
 * Handles GPS validation, API communication simulation, and local caching.
 * 
 * Implements strict validation according to TRACKING_REVIEW.md:
 * - ISO 8601 timestamp validation with future date prevention
 * - Coordinate type safety and range validation
 * - Driver ID format validation
 * - Trip status enforcement
 * - Cache TTL with automatic expiration
 */

import { z } from 'zod';

// Zod Schemas for strict runtime validation
const LocationUpdateSchema = z.object({
  driver_id: z.string()
    .min(1, "ID Driver tidak boleh kosong")
    .regex(/^[A-Za-z0-9_-]+$/, "Format ID Driver tidak valid (hanya alphanumeric, underscore, hyphen)")
    .max(50, "ID Driver terlalu panjang"),
  lat: z.number()
    .min(-90, "Latitude harus antara -90 dan 90")
    .max(90, "Latitude harus antara -90 dan 90")
    .finite("Latitude harus nilai numerik yang valid"),
  lng: z.number()
    .min(-180, "Longitude harus antara -180 dan 180")
    .max(180, "Longitude harus antara -180 dan 180")
    .finite("Longitude harus nilai numerik yang valid"),
  timestamp: z.string()
    .datetime("Timestamp harus format ISO 8601")
    .refine(
      (ts) => new Date(ts).getTime() <= Date.now() + 30000,
      "Timestamp tidak boleh di masa depan (toleransi 30 detik)"
    ),
});

const ActiveTripContextSchema = z.object({
  driver_id: z.string(),
  trip_id: z.string(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
});

export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;
export type ActiveTripContext = z.infer<typeof ActiveTripContextSchema>;

export interface TrackingResponse {
  success: boolean;
  message: string;
  last_updated?: string;
  error?: string;
}

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: string;
  expiry: number;
}

const CACHE_KEY = "pyugo_last_driver_location";
const ACTIVE_TRIPS_KEY = "pyugo_active_driver_trips";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TIMESTAMP_SKEW_MS = 30 * 1000; // 30 seconds (clock skew tolerance)

export class TrackingService {
  /**
   * Validates GPS coordinates strictly.
   * @throws Error if coordinates are invalid
   */
  static validateCoordinates(lat: number, lng: number): void {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error("Koordinat harus tipe number");
    }
    
    if (!isFinite(lat) || !isFinite(lng)) {
      throw new Error("Koordinat harus finite number (bukan Infinity atau NaN)");
    }
    
    if (lat < -90 || lat > 90) {
      throw new Error("Latitude harus antara -90 dan 90");
    }
    
    if (lng < -180 || lng > 180) {
      throw new Error("Longitude harus antara -180 dan 180");
    }
  }

  /**
   * Validates timestamp format (ISO 8601) and ensures it's not in the future.
   * Allows small clock skew tolerance for network delays.
   * @throws Error if timestamp is invalid or in future
   */
  static validateTimestamp(timestamp: string): void {
    const date = new Date(timestamp);
    
    // Check if valid ISO 8601 format
    if (isNaN(date.getTime())) {
      throw new Error("Format timestamp tidak valid. Gunakan ISO 8601 format (2026-03-26T15:30:00Z)");
    }

    // Ensure it's a proper ISO string
    if (!timestamp.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/)) {
      throw new Error("Timestamp harus format ISO 8601 yang valid");
    }

    // Check not in future (with tolerance)
    const now = new Date();
    if (date.getTime() > now.getTime() + MAX_TIMESTAMP_SKEW_MS) {
      throw new Error(`Timestamp tidak boleh di masa depan. Perbedaan: ${date.getTime() - now.getTime()}ms`);
    }
  }

  /**
   * Validates driver ID format and existence.
   * @throws Error if driver_id is invalid
   */
  static validateDriverId(driver_id: string): void {
    if (!driver_id || typeof driver_id !== 'string') {
      throw new Error("ID Driver harus string dan tidak boleh kosong");
    }

    if (driver_id.trim().length === 0) {
      throw new Error("ID Driver tidak boleh hanya whitespace");
    }

    if (!/^[A-Za-z0-9_-]+$/.test(driver_id)) {
      throw new Error("Format ID Driver tidak valid. Hanya alphanumeric, underscore, dan hyphen yang diizinkan");
    }

    if (driver_id.length > 50) {
      throw new Error("ID Driver terlalu panjang (maksimal 50 karakter)");
    }
  }

  /**
   * Checks if driver has an active trip.
   * @returns true if driver is currently on an active trip
   */
  static hasActiveTripContext(driver_id: string): boolean {
    try {
      const activeTrips = JSON.parse(localStorage.getItem(ACTIVE_TRIPS_KEY) || "{}");
      const tripContext = activeTrips[driver_id];
      
      if (!tripContext) return false;

      // Validate trip context structure
      ActiveTripContextSchema.parse(tripContext);
      
      // Check if trip is in progress
      return tripContext.status === 'in_progress';
    } catch (e) {
      console.warn(`[TrackingService] Error checking trip context for ${driver_id}:`, e);
      return false;
    }
  }

  /**
   * Sets active trip context for a driver.
   * Used to enforce business rule: only accept location updates during active trips.
   */
  static setActiveTripContext(driver_id: string, trip_id: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'): void {
    try {
      const activeTrips = JSON.parse(localStorage.getItem(ACTIVE_TRIPS_KEY) || "{}");
      activeTrips[driver_id] = {
        driver_id,
        trip_id,
        status,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ACTIVE_TRIPS_KEY, JSON.stringify(activeTrips));
    } catch (e) {
      console.warn(`[TrackingService] Error setting trip context:`, e);
    }
  }

  /**
   * Clears active trip context for a driver.
   */
  static clearActiveTripContext(driver_id: string): void {
    try {
      const activeTrips = JSON.parse(localStorage.getItem(ACTIVE_TRIPS_KEY) || "{}");
      delete activeTrips[driver_id];
      localStorage.setItem(ACTIVE_TRIPS_KEY, JSON.stringify(activeTrips));
    } catch (e) {
      console.warn(`[TrackingService] Error clearing trip context:`, e);
    }
  }

  /**
   * Cleans up expired cache entries across all drivers.
   */
  static cleanExpiredCache(): void {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const now = Date.now();
      let cleaned = 0;

      Object.keys(cache).forEach((driver_id) => {
        if (cache[driver_id].expiry < now) {
          delete cache[driver_id];
          cleaned++;
        }
      });

      if (cleaned > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        console.info(`[TrackingService] Cleaned ${cleaned} expired cache entries`);
      }
    } catch (e) {
      console.warn("[TrackingService] Error cleaning cache:", e);
    }
  }

  /**
   * Updates driver location with comprehensive validation.
   * 
   * Validation Rules:
   * 1. Driver ID format validation
   * 2. Strict coordinate validation (type + range)
   * 3. ISO 8601 timestamp validation (no future dates)
   * 4. Trip status enforcement (only accept during active trips)
   * 
   * @throws Error if any validation fails
   */
  static async updateDriverLocation(
    data: LocationUpdate,
    enforceActiveTripContext: boolean = false
  ): Promise<TrackingResponse> {
    try {
      // 1. Parse and validate with Zod schema
      const validated = LocationUpdateSchema.parse(data);
      const { driver_id, lat, lng, timestamp } = validated;

      // 2. Additional manual validations
      this.validateDriverId(driver_id);
      this.validateCoordinates(lat, lng);
      this.validateTimestamp(timestamp);

      // 3. Business Rule: Check active trip context if enforced
      if (enforceActiveTripContext && !this.hasActiveTripContext(driver_id)) {
        throw new Error("Driver tidak memiliki trip aktif. Lokasi tidak diterima saat ini.");
      }

      // 4. Simulation of API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 5. Caching with Expiry
      try {
        const cacheData: Record<string, CachedLocation> = {
          [driver_id]: {
            lat,
            lng,
            timestamp,
            expiry: Date.now() + CACHE_TTL_MS,
          },
        };
        const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...existingCache, ...cacheData }));
        console.info(`[TrackingService] Location cached for ${driver_id} (expires in 5 min)`);
      } catch (e) {
        console.warn("[TrackingService] Gagal menyimpan cache lokasi", e);
      }

      // 6. Persistence Simulation
      console.log(`[API] Location updated for driver ${driver_id}:`, {
        lat,
        lng,
        timestamp,
        validatedAt: new Date().toISOString(),
      });

      // 7. Notification Trigger
      this.triggerRealTimeNotification(driver_id, lat, lng, timestamp);

      return {
        success: true,
        message: "Lokasi berhasil diperbarui",
        last_updated: timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validasi gagal";
      console.error("[TrackingService] Location update failed:", errorMessage);
      
      return {
        success: false,
        message: "Gagal memperbarui lokasi",
        error: errorMessage,
      };
    }
  }

  /**
   * Retrieves the last known location for a driver with automatic cache expiry.
   * @returns Location if valid and not expired, null otherwise
   */
  static async getLastKnownLocation(driver_id: string): Promise<LocationUpdate | null> {
    try {
      // Validate driver ID
      this.validateDriverId(driver_id);

      // 1. Check Cache
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const driverData = cache[driver_id] as CachedLocation | undefined;

      if (driverData) {
        // 2. Check if cache is still valid
        const now = Date.now();
        if (now <= driverData.expiry) {
          const timeLeftMs = driverData.expiry - now;
          console.info(
            `[TrackingService] Cache hit for ${driver_id} (expires in ${(timeLeftMs / 1000).toFixed(0)}s)`
          );
          return {
            driver_id,
            lat: driverData.lat,
            lng: driverData.lng,
            timestamp: driverData.timestamp,
          };
        } else {
          console.info(`[TrackingService] Cache for ${driver_id} has expired (TTL exceeded)`);
          // Remove expired entry
          delete cache[driver_id];
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        }
      }

      // 3. Simulate API Fetch if not in cache or expired
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.info(`[TrackingService] No valid cache for ${driver_id}`);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error retrieving location";
      console.error("[TrackingService] Get location failed:", errorMessage);
      return null;
    }
  }

  /**
   * Simulated real-time notification trigger.
   * Dispatches custom event for real-time tracking updates.
   * 
   * In production, this would:
   * - Send WebSocket message to Socket.io server
   * - Trigger push notifications to passengers
   * - Update Analytics dashboard
   */
  private static triggerRealTimeNotification(
    driver_id: string,
    lat: number,
    lng: number,
    timestamp: string
  ) {
    try {
      const event = new CustomEvent("driver_location_update", {
        detail: {
          driver_id,
          lat,
          lng,
          timestamp,
          receivedAt: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
      console.info(`[TrackingService] Notification triggered for ${driver_id}`);
    } catch (e) {
      console.warn("[TrackingService] Error triggering notification:", e);
    }
  }

  /**
   * Gets cache statistics for monitoring and debugging.
   */
  static getCacheStats(): {
    totalCached: number;
    active: number;
    expired: number;
  } {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const now = Date.now();
      let active = 0;
      let expired = 0;

      Object.values(cache).forEach((data: any) => {
        if (data.expiry && now <= data.expiry) {
          active++;
        } else {
          expired++;
        }
      });

      return {
        totalCached: Object.keys(cache).length,
        active,
        expired,
      };
    } catch (e) {
      console.warn("[TrackingService] Error getting cache stats:", e);
      return { totalCached: 0, active: 0, expired: 0 };
    }
  }
}
