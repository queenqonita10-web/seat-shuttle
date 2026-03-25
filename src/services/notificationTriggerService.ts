/**
 * Notification Trigger Service
 * Listens to real-time location updates and triggers notifications
 * 
 * Features:
 * - Automatic proximity-based notifications
 * - Arrival alerts
 * - Incident/alert handling
 * - Distance and ETA calculations
 */

import { DriverLocationUpdate, realtimeTrackingService } from './realtimeTrackingService';
import { notificationService } from './notificationService';
import { TrackingService } from './trackingService';

// ==================== TYPES ====================

export interface LocationTriggerConfig {
  enabled: boolean;
  nearbyDistance: number; // meters (default: 1000m / 1km)
  arrivedDistance: number; // meters (default: 100m)
  etaThreshold: number; // minutes (default: 5)
}

export interface DriverLocationState {
  driver_id: string;
  lastLocation?: DriverLocationUpdate;
  lastNotificationTime: number;
  notificationsSent: {
    nearby: boolean;
    arrived: boolean;
  };
}

// ==================== CONSTANTS ====================

const DEFAULT_CONFIG: LocationTriggerConfig = {
  enabled: true,
  nearbyDistance: 1000, // 1km
  arrivedDistance: 100, // 100m
  etaThreshold: 5, // 5 minutes
};

const NOTIFICATION_COOLDOWN_MS = 60000; // Min time between notifications (1 minute)

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 * 1000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate ETA in minutes based on distance and speed
 */
function estimateETA(distance: number, speed: number = 40): number {
  if (speed === 0) return 999;
  const hours = distance / (speed * 1000); // distance is in meters, speed in km/h
  return Math.ceil(hours * 60);
}

// ==================== NOTIFICATION TRIGGER SERVICE ====================

export class NotificationTriggerService {
  private static instance: NotificationTriggerService | null = null;
  private config: LocationTriggerConfig = DEFAULT_CONFIG;
  private driverStates: Map<string, DriverLocationState> = new Map();
  private systemActive = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationTriggerService {
    if (!NotificationTriggerService.instance) {
      NotificationTriggerService.instance = new NotificationTriggerService();
    }
    return NotificationTriggerService.instance;
  }

  /**
   * Initialize notification triggers
   */
  async initialize(config: Partial<LocationTriggerConfig> = {}): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.systemActive = true;

    console.info('[NotificationTrigger] Initialized with config:', this.config);

    // Start listening to real-time location updates
    await realtimeTrackingService.initialize();
  }

  /**
   * Setup location update listener (call from tracking component)
   */
  setupLocationListener(
    driverId: string,
    pickupLat: number,
    pickupLng: number,
    pickupLabel: string
  ): () => void {
    if (!this.config.enabled) {
      return () => {};
    }

    // Initialize driver state
    if (!this.driverStates.has(driverId)) {
      this.driverStates.set(driverId, {
        driver_id: driverId,
        lastNotificationTime: 0,
        notificationsSent: {
          nearby: false,
          arrived: false,
        },
      });
    }

    // Subscribe to driver location updates
    const unsubscribe = realtimeTrackingService.subscribe(
      driverId,
      (event) => {
        if (event.type === 'location_update' && event.data) {
          this.handleLocationUpdate(
            event.data,
            pickupLat,
            pickupLng,
            pickupLabel
          );
        }
      }
    );

    console.info('[NotificationTrigger] Listening to driver:', driverId);

    return unsubscribe;
  }

  /**
   * Handle location update and trigger notifications
   */
  private async handleLocationUpdate(
    location: DriverLocationUpdate,
    pickupLat: number,
    pickupLng: number,
    pickupLabel: string
  ): Promise<void> {
    const driverId = location.driver_id;
    const state = this.driverStates.get(driverId);

    if (!state) {
      console.warn('[NotificationTrigger] No state for driver:', driverId);
      return;
    }

    // Store last location
    state.lastLocation = location;

    // Calculate distance to pickup
    const distance = calculateDistance(
      location.lat,
      location.lng,
      pickupLat,
      pickupLng
    );

    // Calculate ETA
    const eta = estimateETA(distance, location.speed || 40);

    // Check notification cooldown
    const timeSinceLastNotification = Date.now() - state.lastNotificationTime;
    const onCooldown = timeSinceLastNotification < NOTIFICATION_COOLDOWN_MS;

    console.debug('[NotificationTrigger] Update:', {
      driver: driverId,
      distance: distance.toFixed(0),
      eta,
      speed: location.speed,
      onCooldown,
    });

    // Trigger notifications based on proximity
    if (
      distance < this.config.arrivedDistance &&
      !state.notificationsSent.arrived &&
      !onCooldown
    ) {
      await notificationService.sendArrivedNotification(
        driverId,
        pickupLabel
      );
      state.notificationsSent.arrived = true;
      state.lastNotificationTime = Date.now();
      console.info('[NotificationTrigger] Sent ARRIVED notification');
    } else if (
      distance < this.config.nearbyDistance &&
      !state.notificationsSent.nearby &&
      !onCooldown
    ) {
      await notificationService.sendNearbyNotification(
        driverId,
        pickupLabel
      );
      state.notificationsSent.nearby = true;
      state.lastNotificationTime = Date.now();
      console.info('[NotificationTrigger] Sent NEARBY notification');
    } else if (
      eta <= this.config.etaThreshold &&
      !state.notificationsSent.arrived &&
      !onCooldown
    ) {
      await notificationService.sendArrivalNotification(
        driverId,
        eta,
        pickupLabel
      );
      state.lastNotificationTime = Date.now();
      console.info('[NotificationTrigger] Sent ETA notification');
    }
  }

  /**
   * Get current driver state (for debugging)
   */
  getDriverState(driverId: string): DriverLocationState | undefined {
    return this.driverStates.get(driverId);
  }

  /**
   * Reset notifications for a driver (useful for testing)
   */
  resetDriver(driverId: string): void {
    const state = this.driverStates.get(driverId);
    if (state) {
      state.notificationsSent = {
        nearby: false,
        arrived: false,
      };
      state.lastNotificationTime = 0;
      console.info('[NotificationTrigger] Reset notifications for:', driverId);
    }
  }

  /**
   * Update trigger configuration
   */
  setConfig(config: Partial<LocationTriggerConfig>): void {
    this.config = { ...this.config, ...config };
    console.info('[NotificationTrigger] Config updated:', this.config);
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Stop notification triggers
   */
  stop(): void {
    this.systemActive = false;
    this.driverStates.clear();
    console.info('[NotificationTrigger] Stopped');
  }

  /**
   * Destroy service
   */
  destroy(): void {
    this.stop();
  }
}

// Export singleton
export const notificationTriggerService = NotificationTriggerService.getInstance();
