/**
 * Tracking Service for Driver Location
 * Handles GPS validation, API communication simulation, and local caching.
 */

export interface LocationUpdate {
  driver_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface TrackingResponse {
  success: boolean;
  message: string;
  last_updated?: string;
}

const CACHE_KEY = "pyugo_last_driver_location";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class TrackingService {
  /**
   * Validates GPS coordinates.
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    if (typeof lat !== "number" || typeof lng !== "number") return false;
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Validates timestamp format and ensures it's not in the future.
   */
  static validateTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return false;
    
    // Allow for a small clock skew (30 seconds)
    const now = new Date();
    return date.getTime() <= now.getTime() + 30000;
  }

  /**
   * Updates driver location.
   */
  static async updateDriverLocation(data: LocationUpdate): Promise<TrackingResponse> {
    const { driver_id, lat, lng, timestamp } = data;

    // 1. Validation
    if (!driver_id) {
      throw new Error("ID Driver tidak boleh kosong");
    }

    if (!this.validateCoordinates(lat, lng)) {
      throw new Error("Koordinat GPS tidak valid");
    }

    if (!this.validateTimestamp(timestamp)) {
      throw new Error("Timestamp tidak valid atau berada di masa depan");
    }

    // 2. Simulation of API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. Caching with Expiry
    try {
      const cacheData = {
        [driver_id]: { lat, lng, timestamp, expiry: Date.now() + CACHE_TTL_MS },
      };
      const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...existingCache, ...cacheData }));
    } catch (e) {
      console.warn("[TrackingService] Gagal menyimpan cache lokasi", e);
    }

    // 4. Persistence Simulation
    console.log(`[API] Location updated for driver ${driver_id}:`, { lat, lng, timestamp });

    // 5. Notification Trigger
    this.triggerRealTimeNotification(driver_id, lat, lng);

    return {
      success: true,
      message: "Lokasi berhasil diperbarui",
      last_updated: timestamp,
    };
  }

  /**
   * Retrieves the last known location for a driver.
   */
  static async getLastKnownLocation(driver_id: string): Promise<LocationUpdate | null> {
    // 1. Check Cache
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const driverData = cache[driver_id];

    if (driverData) {
      // Check if cache is still valid
      if (Date.now() <= driverData.expiry) {
        return { driver_id, lat: driverData.lat, lng: driverData.lng, timestamp: driverData.timestamp };
      } else {
        console.info(`[TrackingService] Cache for ${driver_id} has expired`);
        // Optionally remove expired entry
        delete cache[driver_id];
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    }

    // 2. Simulate API Fetch if not in cache or expired
    await new Promise((resolve) => setTimeout(resolve, 200));
    return null;
  }

  /**
   * Simulated real-time notification trigger.
   */
  private static triggerRealTimeNotification(driver_id: string, lat: number, lng: number) {
    // Logic to emit events via Socket.io or similar
    const event = new CustomEvent("driver_location_update", {
      detail: { driver_id, lat, lng, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }
}
