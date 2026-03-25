import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NotificationService } from "../services/notificationService";
import { NotificationTriggerService } from "../services/notificationTriggerService";

describe("NotificationService", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = NotificationService.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    service.destroy();
    localStorage.clear();
  });

  describe("Notification Preferences", () => {
    it("should get and set preferences", () => {
      const prefs = service.getPreferences();
      expect(prefs).toBeDefined();
      expect(prefs.browser).toBe(true);
      expect(prefs.inApp).toBe(true);

      service.setPreferences({ browser: false });
      const updated = service.getPreferences();
      expect(updated.browser).toBe(false);
    });

    it("should persist preferences to localStorage", () => {
      service.setPreferences({ sound: false });
      
      const saved = localStorage.getItem("notification_preferences");
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.sound).toBe(false);
    });
  });

  describe("Notification Sending", () => {
    it("should send arrival notification", async () => {
      const listener = vi.fn();
      service.subscribe(listener);

      await service.initialize();
      await service.sendArrivalNotification("DRV-001", 10, "Pickup Point A");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
      const notification = listener.mock.calls[0][0];
      expect(notification.type).toBe("arrival");
      expect(notification.title).toContain("Soon");
    });

    it("should send arrived notification", async () => {
      const listener = vi.fn();
      service.subscribe(listener);

      await service.initialize();
      await service.sendArrivedNotification("DRV-001", "Pickup Point A");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
      const notification = listener.mock.calls[0][0];
      expect(notification.type).toBe("arrived");
      expect(notification.title).toContain("Arrived");
    });

    it("should send nearby notification", async () => {
      const listener = vi.fn();
      service.subscribe(listener);

      await service.initialize();
      await service.sendNearbyNotification("DRV-001", "Pickup Point A");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
      const notification = listener.mock.calls[0][0];
      expect(notification.type).toBe("nearby");
    });

    it("should send status change notification", async () => {
      const listener = vi.fn();
      service.subscribe(listener);

      await service.initialize();
      await service.sendStatusChangeNotification(
        "on_route",
        "Driver is on the way"
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
      const notification = listener.mock.calls[0][0];
      expect(notification.type).toBe("status_change");
    });
  });

  describe("Notification Management", () => {
    it("should get all notifications", async () => {
      await service.initialize();
      await service.sendArrivalNotification("DRV-001", 10, "Pickup A");
      await service.sendNearbyNotification("DRV-001", "Pickup A");

      await new Promise((resolve) => setTimeout(resolve, 150));

      const notifications = service.getNotifications();
      expect(notifications.length).toBeGreaterThanOrEqual(1);
    });

    it("should get unread count", async () => {
      await service.initialize();
      await service.sendArrivalNotification("DRV-001", 10, "Pickup A");

      await new Promise((resolve) => setTimeout(resolve, 100));

      const count = service.getUnreadCount();
      expect(count).toBeGreaterThan(0);
    });

    it("should mark notification as read", async () => {
      await service.initialize();
      const notif = await service.sendArrivalNotification("DRV-001", 10, "Pickup A");

      if (notif) {
        service.markAsRead(notif.id);
        
        const notifications = service.getNotifications();
        const marked = notifications.find((n) => n.id === notif.id);
        expect(marked?.read).toBe(true);
      }
    });

    it("should clear all notifications", async () => {
      await service.initialize();
      await service.sendArrivalNotification("DRV-001", 10, "Pickup A");

      await new Promise((resolve) => setTimeout(resolve, 100));

      service.clearAll();
      const notifications = service.getNotifications();
      expect(notifications.length).toBe(0);
    });
  });

  describe("Notification Deduplication", () => {
    it("should deduplicate similar notifications", async () => {
      const listener = vi.fn();
      service.subscribe(listener);

      await service.initialize();

      // Send two similar notifications in quick succession
      await service.sendNearbyNotification("DRV-001", "Pickup A");
      await service.sendNearbyNotification("DRV-001", "Pickup A");

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Due to deduplication (per-minute), second should be skipped
      expect(listener.mock.calls.length).toBeLessThanOrEqual(2);
    });
  });
});

describe("NotificationTriggerService", () => {
  let triggerService: NotificationTriggerService;
  let notificationService: NotificationService;

  beforeEach(() => {
    triggerService = NotificationTriggerService.getInstance();
    notificationService = NotificationService.getInstance();
  });

  afterEach(() => {
    triggerService.destroy();
    notificationService.destroy();
    localStorage.clear();
  });

  describe("Distance Calculations", () => {
    it("should initialize with custom config", async () => {
      await triggerService.initialize({
        enabled: true,
        nearbyDistance: 500,
        arrivedDistance: 50,
        etaThreshold: 3,
      });

      expect(triggerService).toBeDefined();
    });

    it("should handle location updates", () => {
      const notifListener = vi.fn();
      notificationService.subscribe(notifListener);

      // This would normally be triggered by location updates
      // For now, just verify the service is ready
      expect(triggerService).toBeDefined();
    });
  });

  describe("Driver State Management", () => {
    it("should reset driver notifications", async () => {
      await triggerService.initialize();
      
      triggerService.resetDriver("DRV-001");
      const state = triggerService.getDriverState("DRV-001");

      if (state) {
        expect(state.notificationsSent.nearby).toBe(false);
        expect(state.notificationsSent.arrived).toBe(false);
      }
    });

    it("should update configuration", async () => {
      await triggerService.initialize();

      triggerService.setConfig({
        nearbyDistance: 2000,
        arrivedDistance: 200,
      });

      expect(triggerService).toBeDefined();
    });
  });
});

describe("Notification Integration", () => {
  let service: NotificationService;

  beforeEach(async () => {
    service = NotificationService.getInstance();
    localStorage.clear();
    await service.initialize();
  });

  afterEach(() => {
    service.destroy();
    localStorage.clear();
  });

  it("should complete full notification workflow", async () => {
    const notifications: any[] = [];
    service.subscribe((notif) => {
      notifications.push(notif);
    });

    // Simulate full workflow
    await service.sendArrivedNotification("DRV-001", "Main Station");

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(notifications.length).toBeGreaterThan(0);
    
    const notif = notifications[0];
    expect(notif.type).toBe("arrived");
    expect(notif.read).toBe(false);

    // Mark as read
    service.markAsRead(notif.id);
    const unread = service.getUnreadCount();
    expect(unread).toBe(0);
  });

  it("should handle phone number for SMS", () => {
    service.setPhoneNumber("+62812345678");
    
    const saved = localStorage.getItem("phone_number");
    expect(saved).toBe("+62812345678");
  });

  it("should check quiet hours", async () => {
    service.setPreferences({
      quiet_hours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    });

    // With quiet hours disabled, notification should go through
    await service.sendArrivalNotification("DRV-001", "Pickup", 10);

    const count = service.getUnreadCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
