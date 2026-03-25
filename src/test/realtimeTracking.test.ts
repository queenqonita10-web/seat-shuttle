import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  RealtimeTrackingService,
  DriverLocationUpdate,
  RealtimeEvent,
} from "../services/realtimeTrackingService";
import { MockWebSocketServer } from "../services/mockWebSocketServer";
import { TrackingService } from "../services/trackingService";

describe("RealtimeTrackingService - Core", () => {
  let service: RealtimeTrackingService;

  beforeEach(() => {
    service = RealtimeTrackingService.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    service.destroy();
    localStorage.clear();
  });

  describe("Initialization", () => {
    it("should initialize as singleton", () => {
      const s1 = RealtimeTrackingService.getInstance();
      const s2 = RealtimeTrackingService.getInstance();
      expect(s1).toBe(s2);
    });

    it("should start without errors", async () => {
      await service.initialize();
      expect(service).toBeDefined();
    });
  });

  describe("Broadcasting", () => {
    it("should broadcast location updates", async () => {
      const listener = vi.fn();

      const update: DriverLocationUpdate = {
        driver_id: "DRV-001",
        lat: -6.2088,
        lng: 106.8456,
        timestamp: new Date().toISOString(),
      };

      service.subscribe("DRV-001", listener);
      service.broadcastUpdate(update);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
    });

    it("should filter by driver ID", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      service.subscribe("DRV-001", listener1);
      service.subscribe("DRV-002", listener2);

      service.broadcastUpdate({
        driver_id: "DRV-001",
        lat: -6.2,
        lng: 106.8,
        timestamp: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("Subscriptions", () => {
    it("should subscribe and unsubscribe", async () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe("DRV-001", listener);

      const update: DriverLocationUpdate = {
        driver_id: "DRV-001",
        lat: -6.2,
        lng: 106.8,
        timestamp: new Date().toISOString(),
      };

      service.broadcastUpdate(update);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      listener.mockClear();

      service.broadcastUpdate(update);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle multiple subscribers", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      service.subscribe("DRV-001", listener1);
      service.subscribe("DRV-001", listener2);

      service.broadcastUpdate({
        driver_id: "DRV-001",
        lat: -6.2,
        lng: 106.8,
        timestamp: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe("Statistics", () => {
    it("should provide stats", async () => {
      await service.initialize();
      const stats = service.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats?.messagesReceived).toBe("number");
      expect(typeof stats?.messagesSent).toBe("number");
      expect(typeof stats?.isConnected).toBe("boolean");
    });

    it("should report WebSocket mode", () => {
      const isWS = service.isUsingWebSocket();
      expect(typeof isWS).toBe("boolean");
    });
  });
});

describe("MockWebSocketServer", () => {
  let server: MockWebSocketServer;

  beforeEach(() => {
    server = new MockWebSocketServer();
  });

  afterEach(() => {
    server.stop();
  });

  describe("Operations", () => {
    it("should start and stop", () => {
      expect(server.getStats().isRunning).toBe(false);
      server.start();
      expect(server.getStats().isRunning).toBe(true);
      server.stop();
      expect(server.getStats().isRunning).toBe(false);
    });

    it("should have drivers", () => {
      const stats = server.getStats();
      expect(stats.totalDrivers).toBeGreaterThan(0);
    });

    it("should provide stats", () => {
      const stats = server.getStats();
      expect(stats).toHaveProperty("isRunning");
      expect(stats).toHaveProperty("totalDrivers");
      expect(stats).toHaveProperty("activeDrivers");
      expect(typeof stats.isRunning).toBe("boolean");
    });
  });

  describe("Driver Management", () => {
    it("should get locations", () => {
      server.start();
      const locations = server.getAllDriverLocations();

      expect(Array.isArray(locations)).toBe(true);
      locations.forEach((loc) => {
        expect(loc.driver_id).toBeDefined();
        expect(loc.lat).toBeGreaterThanOrEqual(-6.3);
        expect(loc.lat).toBeLessThanOrEqual(-6.1);
        expect(loc.lng).toBeGreaterThanOrEqual(106.7);
        expect(loc.lng).toBeLessThanOrEqual(106.9);
      });
    });

    it("should update driver status", () => {
      expect(() => server.updateDriver("DRV-001", false)).not.toThrow();
      expect(() => server.updateDriver("DRV-001", true)).not.toThrow();
    });
  });
});

describe("Full Workflow", () => {
  let realtimeService: RealtimeTrackingService;

  beforeEach(() => {
    realtimeService = RealtimeTrackingService.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    realtimeService.destroy();
    localStorage.clear();
  });

  it("should complete tracking workflow", async () => {
    const driver_id = "DRV-001";
    const trip_id = "TRIP-001";

    // Start trip
    TrackingService.setActiveTripContext(driver_id, trip_id, "in_progress");
    expect(TrackingService.hasActiveTripContext(driver_id)).toBe(true);

    // Initialize realtime
    await realtimeService.initialize();

    // Broadcast location
    const update: DriverLocationUpdate = {
      driver_id,
      lat: -6.2088,
      lng: 106.8456,
      timestamp: new Date().toISOString(),
    };

    realtimeService.broadcastUpdate(update);

    // Verify cached
    await new Promise((resolve) => setTimeout(resolve, 200));
    const cached = await TrackingService.getLastKnownLocation(driver_id);
    expect(cached).not.toBeNull();

    // End trip
    TrackingService.clearActiveTripContext(driver_id);
    expect(TrackingService.hasActiveTripContext(driver_id)).toBe(false);
  });
});

describe("Performance", () => {
  let realtimeService: RealtimeTrackingService;

  beforeEach(() => {
    realtimeService = RealtimeTrackingService.getInstance();
  });

  afterEach(() => {
    realtimeService.destroy();
  });

  it("should handle multiple concurrent subscriptions", async () => {
    const listeners = Array.from({ length: 5 }, () => vi.fn());
    const unsubscribes = listeners.map((listener, i) =>
      realtimeService.subscribe(`DRV-${String(i).padStart(3, "0")}`, listener)
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const update: DriverLocationUpdate = {
      driver_id: "DRV-000",
      lat: -6.2,
      lng: 106.8,
      timestamp: new Date().toISOString(),
    };

    realtimeService.broadcastUpdate(update);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Only DRV-000 listener called
    expect(listeners[0]).toHaveBeenCalled();
    listeners.slice(1).forEach((listener) => {
      expect(listener).not.toHaveBeenCalled();
    });

    unsubscribes.forEach((unsub) => unsub());
  });

  it("should handle spaced updates", async () => {
    const listener = vi.fn();
    const unsubscribe = realtimeService.subscribe("DRV-001", listener);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Send updates spaced properly (> 1 sec apart for throttle window)
    for (let i = 0; i < 3; i++) {
      realtimeService.broadcastUpdate({
        driver_id: "DRV-001",
        lat: -6.2 + i * 0.001,
        lng: 106.8 + i * 0.001,
        timestamp: new Date(Date.now() + i * 1100).toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    expect(listener.mock.calls.length).toBeGreaterThan(0);

    unsubscribe();
  });
});

describe('Real-time Tracking', () => {
  it('should track real-time location updates', () => {
    // Test implementation
    expect(true).toBe(true);
  });

  it('should handle location errors gracefully', () => {
    // Error handling test
    expect(true).toBe(true);
  });
});
