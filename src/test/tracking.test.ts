import { describe, it, expect, beforeEach, vi } from "vitest";
import { TrackingService, LocationUpdate } from "../services/trackingService";

describe("TrackingService", () => {
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

  describe("validateCoordinates", () => {
    it("should return true for valid coordinates", () => {
      expect(TrackingService.validateCoordinates(0, 0)).toBe(true);
      expect(TrackingService.validateCoordinates(-90, -180)).toBe(true);
      expect(TrackingService.validateCoordinates(90, 180)).toBe(true);
    });

    it("should return false for invalid latitude", () => {
      expect(TrackingService.validateCoordinates(-91, 0)).toBe(false);
      expect(TrackingService.validateCoordinates(91, 0)).toBe(false);
    });

    it("should return false for invalid longitude", () => {
      expect(TrackingService.validateCoordinates(0, -181)).toBe(false);
      expect(TrackingService.validateCoordinates(0, 181)).toBe(false);
    });

    it("should return false for non-numeric input", () => {
      // @ts-ignore
      expect(TrackingService.validateCoordinates("abc", 0)).toBe(false);
      expect(TrackingService.validateCoordinates(NaN, 0)).toBe(false);
    });
  });

  describe("validateTimestamp", () => {
    it("should return true for valid past/current timestamp", () => {
      const now = new Date().toISOString();
      expect(TrackingService.validateTimestamp(now)).toBe(true);
    });

    it("should return false for invalid date string", () => {
      expect(TrackingService.validateTimestamp("invalid-date")).toBe(false);
    });

    it("should return false for future timestamp", () => {
      const future = new Date(Date.now() + 100000).toISOString();
      expect(TrackingService.validateTimestamp(future)).toBe(false);
    });
  });

  describe("updateDriverLocation", () => {
    it("should successfully update location with valid data", async () => {
      const response = await TrackingService.updateDriverLocation(validLocation);
      expect(response.success).toBe(true);
      expect(response.last_updated).toBe(validLocation.timestamp);
    });

    it("should throw error if driver_id is empty", async () => {
      const invalidData = { ...validLocation, driver_id: "" };
      await expect(TrackingService.updateDriverLocation(invalidData)).rejects.toThrow("ID Driver tidak boleh kosong");
    });

    it("should throw error if coordinates are invalid", async () => {
      const invalidData = { ...validLocation, lat: 100 };
      await expect(TrackingService.updateDriverLocation(invalidData)).rejects.toThrow("Koordinat GPS tidak valid");
    });

    it("should cache the last location in localStorage", async () => {
      await TrackingService.updateDriverLocation(validLocation);
      const cache = JSON.parse(localStorage.getItem("pyugo_last_driver_location") || "{}");
      expect(cache[mockDriverId]).toBeDefined();
      expect(cache[mockDriverId].lat).toBe(validLocation.lat);
    });
  });

  describe("getLastKnownLocation", () => {
    it("should return null if no location is cached", async () => {
      const location = await TrackingService.getLastKnownLocation("non-existent-driver");
      expect(location).toBeNull();
    });

    it("should return cached location if available", async () => {
      // Setup cache
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
  });
});
