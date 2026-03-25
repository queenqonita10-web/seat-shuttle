import { describe, it, expect, beforeEach, vi } from "vitest";
import { TrackingService, LocationUpdate } from "../services/trackingService";

describe("TrackingService - Enhanced Validation", () => {
  const mockDriverId = "test-driver-001";
  const validLocation: LocationUpdate = {
    driver_id: mockDriverId,
    lat: -6.2088,
    lng: 106.8456,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ==================== COORDINATE VALIDATION ====================
  describe("validateCoordinates", () => {
    it("should pass for valid coordinates", () => {
      expect(() => TrackingService.validateCoordinates(0, 0)).not.toThrow();
      expect(() => TrackingService.validateCoordinates(-90, -180)).not.toThrow();
      expect(() => TrackingService.validateCoordinates(90, 180)).not.toThrow();
    });

    it("should throw for invalid latitude", () => {
      expect(() => TrackingService.validateCoordinates(-91, 0)).toThrow("Latitude harus antara -90 dan 90");
      expect(() => TrackingService.validateCoordinates(91, 0)).toThrow("Latitude harus antara -90 dan 90");
    });

    it("should throw for invalid longitude", () => {
      expect(() => TrackingService.validateCoordinates(0, -181)).toThrow("Longitude harus antara -180 dan 180");
      expect(() => TrackingService.validateCoordinates(0, 181)).toThrow("Longitude harus antara -180 dan 180");
    });

    it("should throw for non-numeric input", () => {
      // @ts-ignore
      expect(() => TrackingService.validateCoordinates("abc", 0)).toThrow("Koordinat harus tipe number");
      expect(() => TrackingService.validateCoordinates(Infinity, 0)).toThrow("finite number");
    });
  });

  // ==================== TIMESTAMP VALIDATION ====================
  describe("validateTimestamp", () => {
    it("should pass for valid ISO 8601 timestamp", () => {
      const now = new Date().toISOString();
      expect(() => TrackingService.validateTimestamp(now)).not.toThrow();
    });

    it("should throw for invalid date string", () => {
      expect(() => TrackingService.validateTimestamp("invalid-date")).toThrow("tidak valid");
    });

    it("should throw for future timestamp beyond tolerance", () => {
      const future = new Date(Date.now() + 100000).toISOString();
      expect(() => TrackingService.validateTimestamp(future)).toThrow("masa depan");
    });

    it("should allow small clock skew (30 seconds tolerance)", () => {
      const nearFuture = new Date(Date.now() + 15000).toISOString(); // 15 seconds
      expect(() => TrackingService.validateTimestamp(nearFuture)).not.toThrow();
    });

    it("should throw for malformed ISO strings", () => {
      expect(() => TrackingService.validateTimestamp("2026-13-01T00:00:00Z")).toThrow();
      expect(() => TrackingService.validateTimestamp("2026-03-26T25:00:00Z")).toThrow();
    });
  });

  // ==================== DRIVER ID VALIDATION ====================
  describe("validateDriverId", () => {
    it("should pass for valid driver IDs", () => {
      expect(() => TrackingService.validateDriverId("DRV-001")).not.toThrow();
      expect(() => TrackingService.validateDriverId("driver_123")).not.toThrow();
      expect(() => TrackingService.validateDriverId("DVR001")).not.toThrow();
    });

    it("should throw for empty driver ID", () => {
      expect(() => TrackingService.validateDriverId("")).toThrow("kosong");
      expect(() => TrackingService.validateDriverId("   ")).toThrow("whitespace");
    });

    it("should throw for invalid characters", () => {
      expect(() => TrackingService.validateDriverId("driver@123")).toThrow("tidak valid");
      expect(() => TrackingService.validateDriverId("driver#456")).toThrow("tidak valid");
      expect(() => TrackingService.validateDriverId("driver.789")).toThrow("tidak valid");
    });

    it("should throw for oversized driver ID", () => {
      const longId = "a".repeat(51);
      expect(() => TrackingService.validateDriverId(longId)).toThrow("terlalu panjang");
    });
  });

  // ==================== ACTIVE TRIP CONTEXT ====================
  describe("Trip Context Management", () => {
    it("should set and retrieve active trip context", () => {
      TrackingService.setActiveTripContext(mockDriverId, "trip-001", "in_progress");
      expect(TrackingService.hasActiveTripContext(mockDriverId)).toBe(true);
    });

    it("should return false when no active trip", () => {
      expect(TrackingService.hasActiveTripContext("unknown-driver")).toBe(false);
    });

    it("should not consider non-active trips as active", () => {
      TrackingService.setActiveTripContext(mockDriverId, "trip-001", "completed");
      expect(TrackingService.hasActiveTripContext(mockDriverId)).toBe(false);
    });

    it("should clear trip context", () => {
      TrackingService.setActiveTripContext(mockDriverId, "trip-001", "in_progress");
      TrackingService.clearActiveTripContext(mockDriverId);
      expect(TrackingService.hasActiveTripContext(mockDriverId)).toBe(false);
    });
  });

  // ==================== LOCATION UPDATE ====================
  describe("updateDriverLocation", () => {
    it("should successfully update location with valid data", async () => {
      const response = await TrackingService.updateDriverLocation(validLocation);
      expect(response.success).toBe(true);
      expect(response.last_updated).toBe(validLocation.timestamp);
    });

    it("should reject with invalid driver_id format", async () => {
      const invalidData = { ...validLocation, driver_id: "driver@invalid" };
      const response = await TrackingService.updateDriverLocation(invalidData);
      expect(response.success).toBe(false);
      expect(response.error).toContain("tidak valid");
    });

    it("should reject with invalid coordinates", async () => {
      const invalidData = { ...validLocation, lat: 100 };
      const response = await TrackingService.updateDriverLocation(invalidData);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Latitude");
    });

    it("should reject with future timestamp", async () => {
      const futureTime = new Date(Date.now() + 100000).toISOString();
      const invalidData = { ...validLocation, timestamp: futureTime };
      const response = await TrackingService.updateDriverLocation(invalidData);
      expect(response.success).toBe(false);
      expect(response.error).toContain("masa depan");
    });

    it("should enforce active trip context when requested", async () => {
      const response = await TrackingService.updateDriverLocation(
        validLocation,
        true // enforce active trip
      );
      expect(response.success).toBe(false);
      expect(response.error).toContain("trip aktif");
    });

    it("should allow location update when trip is active", async () => {
      TrackingService.setActiveTripContext(mockDriverId, "trip-001", "in_progress");
      const response = await TrackingService.updateDriverLocation(
        validLocation,
        true
      );
      expect(response.success).toBe(true);
    });

    it("should cache the last location in localStorage", async () => {
      await TrackingService.updateDriverLocation(validLocation);
      const cache = JSON.parse(localStorage.getItem("pyugo_last_driver_location") || "{}");
      expect(cache[mockDriverId]).toBeDefined();
      expect(cache[mockDriverId].lat).toBe(validLocation.lat);
      expect(cache[mockDriverId].expiry).toBeDefined();
    });
  });

  // ==================== CACHE MANAGEMENT ====================
  describe("getLastKnownLocation", () => {
    it("should return null if no location is cached", async () => {
      const location = await TrackingService.getLastKnownLocation("non-existent-driver");
      expect(location).toBeNull();
    });

    it("should return cached location if available and not expired", async () => {
      await TrackingService.updateDriverLocation(validLocation);
      
      const location = await TrackingService.getLastKnownLocation(mockDriverId);
      expect(location).not.toBeNull();
      expect(location?.driver_id).toBe(mockDriverId);
      expect(location?.lat).toBe(validLocation.lat);
    });

    it("should return null if cached location has expired", async () => {
      vi.useFakeTimers();
      
      // We need to advance timers for the internal setTimeout in updateDriverLocation
      const updatePromise = TrackingService.updateDriverLocation(validLocation);
      vi.advanceTimersByTime(300);
      await updatePromise;
      
      // Advance time by 6 minutes (TTL is 5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      const locationPromise = TrackingService.getLastKnownLocation(mockDriverId);
      vi.advanceTimersByTime(200); // For the fetch simulation delay
      const location = await locationPromise;
      
      expect(location).toBeNull();
      
      vi.useRealTimers();
    });

    it("should throw error for invalid driver ID when retrieving", async () => {
      const location = await TrackingService.getLastKnownLocation("invalid@driver");
      expect(location).toBeNull();
    });
  });

  // ==================== CACHE CLEANUP ====================
  describe("Cache Cleanup", () => {
    it("should clean expired cache entries", async () => {
      // Add multiple entries
      await TrackingService.updateDriverLocation(validLocation);
      await TrackingService.updateDriverLocation({
        ...validLocation,
        driver_id: "driver-002",
      });

      vi.useFakeTimers();
      // Advance time by 6 minutes (TTL is 5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);

      TrackingService.cleanExpiredCache();

      const cache = JSON.parse(localStorage.getItem("pyugo_last_driver_location") || "{}");
      expect(Object.keys(cache).length).toBe(0);

      vi.useRealTimers();
    });

    it("should get cache statistics", async () => {
      await TrackingService.updateDriverLocation(validLocation);
      await TrackingService.updateDriverLocation({
        ...validLocation,
        driver_id: "driver-002",
      });

      const stats = TrackingService.getCacheStats();
      expect(stats.totalCached).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.expired).toBe(0);
    });

    it("should report expired entries in cache stats", async () => {
      await TrackingService.updateDriverLocation(validLocation);

      vi.useFakeTimers();
      vi.advanceTimersByTime(6 * 60 * 1000); // Past TTL

      const stats = TrackingService.getCacheStats();
      expect(stats.expired).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });

  // ==================== REAL-TIME NOTIFICATIONS ====================
  describe("Real-time Notifications", () => {
    it("should dispatch driver_location_update event", async () => {
      const listener = vi.fn();
      window.addEventListener("driver_location_update", listener);

      await TrackingService.updateDriverLocation(validLocation);

      // Give event dispatching time
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener).toHaveBeenCalled();
      const event = listener.mock.calls[0][0] as CustomEvent;
      expect(event.detail.driver_id).toBe(mockDriverId);
      expect(event.detail.lat).toBe(validLocation.lat);
      expect(event.detail.lng).toBe(validLocation.lng);

      window.removeEventListener("driver_location_update", listener);
    });
  });
});
