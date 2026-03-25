/**
 * Real-time Tracking Service with WebSocket
 * Handles real-time location updates via WebSocket with fallback to polling.
 * 
 * Architecture:
 * - Primary: Supabase Realtime (wss://)
 * - Fallback: HTTP polling (localStorage + CustomEvents)
 * - Simulation: MockWebSocketServer for development
 * 
 * Features:
 * - Auto-reconnect on disconnect
 * - Throttled updates (max 1/sec per driver)
 * - Type-safe event system
 * - Comprehensive error handling
 */

import { z } from 'zod';
import { TrackingService, LocationUpdate } from './trackingService';

// ==================== TYPES ====================

export interface DriverLocationUpdate {
  driver_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number; // km/h
  heading?: number; // degrees 0-360
  accuracy?: number; // meters
  trip_id?: string;
}

export interface RealtimeEvent {
  type: 'location_update' | 'connection_open' | 'connection_close' | 'error' | 'subscribed' | 'unsubscribed';
  driver_id?: string;
  data?: DriverLocationUpdate;
  error?: string;
  timestamp: string;
}

export type RealtimeEventListener = (event: RealtimeEvent) => void;

export interface ConnectionStats {
  isConnected: boolean;
  messagesReceived: number;
  messagesSent: number;
  lastMessageAt?: string;
  uptime: number; // seconds
  reconnectCount: number;
}

// Zod schema for runtime validation
const DriverLocationUpdateSchema = z.object({
  driver_id: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.string().datetime(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
  trip_id: z.string().optional(),
});

export type ValidatedLocationUpdate = z.infer<typeof DriverLocationUpdateSchema>;

// ==================== CONSTANTS ====================

const RECONNECT_INTERVAL_MS = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const MESSAGE_THROTTLE_MS = 1000; // Max 1 update per second per driver
const POLLING_INTERVAL_MS = 5000; // Fallback polling interval
const CONNECTION_TIMEOUT_MS = 10000; // Timeout for connection

// ==================== WEBSOCKET MANAGER ====================

class WebSocketConnectionManager {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected = false;
  private reconnectCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageListeners: Set<RealtimeEventListener> = new Set();
  private subscriptions: Map<string, boolean> = new Map(); // driver_id -> subscribed
  private throttleMap: Map<string, number> = new Map(); // driver_id -> last update time
  private stats: ConnectionStats = {
    isConnected: false,
    messagesReceived: 0,
    messagesSent: 0,
    uptime: 0,
    reconnectCount: 0,
  };
  private startTime = Date.now();
  private useFallback = false; // Use HTTP polling fallback

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.warn('[RealtimeTracking] Already connected');
      return;
    }

    try {
      console.info('[RealtimeTracking] Connecting to', this.url);
      
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (event) => this.handleError(event);
      this.ws.onclose = () => this.handleClose();

      // Set timeout for connection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT_MS)
      );

      await Promise.race([
        new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (this.isConnected) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        }),
        timeout,
      ]);
    } catch (error) {
      console.error('[RealtimeTracking] Connection failed:', error);
      this.useFallback = true;
      this.notifyListeners({
        type: 'error',
        error: `WebSocket connection failed: ${error}. Using polling fallback.`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleOpen() {
    console.info('[RealtimeTracking] Connected');
    this.isConnected = true;
    this.reconnectCount = 0;
    this.stats.isConnected = true;

    this.notifyListeners({
      type: 'connection_open',
      timestamp: new Date().toISOString(),
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      this.stats.messagesReceived++;

      // Validate message structure
      const validated = DriverLocationUpdateSchema.parse(message);

      // Extract required fields explicitly for type safety
      const locationData: DriverLocationUpdate = {
        driver_id: String(validated.driver_id),
        lat: Number(validated.lat),
        lng: Number(validated.lng),
        timestamp: String(validated.timestamp),
        ...(validated.speed !== undefined && { speed: validated.speed }),
        ...(validated.heading !== undefined && { heading: validated.heading }),
        ...(validated.accuracy !== undefined && { accuracy: validated.accuracy }),
        ...(validated.trip_id !== undefined && { trip_id: validated.trip_id }),
      };

      // Check throttle
      const lastUpdate = this.throttleMap.get(locationData.driver_id) || 0;
      const timeSinceLastUpdate = Date.now() - lastUpdate;

      if (timeSinceLastUpdate < MESSAGE_THROTTLE_MS) {
        // Skip throttled message
        return;
      }

      this.throttleMap.set(locationData.driver_id, Date.now());
      this.stats.lastMessageAt = new Date().toISOString();

      this.notifyListeners({
        type: 'location_update',
        driver_id: locationData.driver_id,
        data: locationData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[RealtimeTracking] Invalid message:', error);
    }
  }

  private handleError(event: Event) {
    console.error('[RealtimeTracking] WebSocket error:', event);
    this.useFallback = true;

    this.notifyListeners({
      type: 'error',
      error: 'WebSocket error occurred. Switching to polling.',
      timestamp: new Date().toISOString(),
    });
  }

  private handleClose() {
    console.info('[RealtimeTracking] Connection closed');
    this.isConnected = false;
    this.stats.isConnected = false;

    this.notifyListeners({
      type: 'connection_close',
      timestamp: new Date().toISOString(),
    });

    // Attempt reconnect
    this.reconnect();
  }

  private reconnect() {
    if (this.reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[RealtimeTracking] Max reconnect attempts reached. Using fallback.');
      this.useFallback = true;
      return;
    }

    this.reconnectCount++;
    this.stats.reconnectCount++;

    console.info(`[RealtimeTracking] Reconnecting... (attempt ${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Already logged in connect()
      });
    }, RECONNECT_INTERVAL_MS);
  }

  /**
   * Subscribe to driver location updates
   */
  subscribe(driver_id: string): void {
    if (this.subscriptions.has(driver_id)) {
      return; // Already subscribed
    }

    this.subscriptions.set(driver_id, true);
    console.info(`[RealtimeTracking] Subscribed to ${driver_id}`);

    // Only send via WebSocket if connected
    if (this.isConnected && this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          channel: `driver:${driver_id}:location`,
        })
      );
      this.stats.messagesSent++;
    }

    this.notifyListeners({
      type: 'subscribed',
      driver_id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unsubscribe from driver location updates
   */
  unsubscribe(driver_id: string): void {
    if (!this.subscriptions.has(driver_id)) {
      return;
    }

    this.subscriptions.delete(driver_id);
    console.info(`[RealtimeTracking] Unsubscribed from ${driver_id}`);

    if (this.isConnected && this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel: `driver:${driver_id}:location`,
        })
      );
      this.stats.messagesSent++;
    }

    this.notifyListeners({
      type: 'unsubscribed',
      driver_id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add event listener
   */
  addEventListener(listener: RealtimeEventListener): () => void {
    this.messageListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: RealtimeEvent): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[RealtimeTracking] Listener error:', error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.stats.isConnected = false;
    console.info('[RealtimeTracking] Disconnected');
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return {
      ...this.stats,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Check if using fallback (polling)
   */
  isFallbackMode(): boolean {
    return this.useFallback;
  }
}

// ==================== REALTIME TRACKING SERVICE ====================

export class RealtimeTrackingService {
  private static instance: RealtimeTrackingService | null = null;
  private wsManager: WebSocketConnectionManager | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private watchedDrivers: Set<string> = new Set();
  private pollingActive = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): RealtimeTrackingService {
    if (!RealtimeTrackingService.instance) {
      RealtimeTrackingService.instance = new RealtimeTrackingService();
    }
    return RealtimeTrackingService.instance;
  }

  /**
   * Initialize real-time tracking
   * In production: connects to Supabase Realtime
   * In development: uses CustomEvents with simulation
   */
  async initialize(wsUrl?: string): Promise<void> {
    try {
      // Try WebSocket first (production)
      if (wsUrl) {
        this.wsManager = new WebSocketConnectionManager(wsUrl);
        await this.wsManager.connect();
      } else {
        console.info('[RealtimeTracking] No WebSocket URL provided. Using polling fallback.');
      }

      // Setup polling fallback
      this.startPollingFallback();
    } catch (error) {
      console.error('[RealtimeTracking] Initialization error:', error);
      this.startPollingFallback();
    }
  }

  /**
   * Start polling fallback for location updates
   */
  private startPollingFallback(): void {
    if (this.pollingActive) return;

    this.pollingActive = true;
    console.info('[RealtimeTracking] Started polling fallback');

    this.pollingInterval = setInterval(() => {
      this.pollWatchedDrivers();
    }, POLLING_INTERVAL_MS);
  }

  /**
   * Poll for updates of watched drivers
   */
  private async pollWatchedDrivers(): Promise<void> {
    for (const driver_id of this.watchedDrivers) {
      try {
        const location = await TrackingService.getLastKnownLocation(driver_id);
        if (location) {
          // Dispatch as custom event
          const event = new CustomEvent('realtime_location_update', {
            detail: {
              driver_id: location.driver_id,
              lat: location.lat,
              lng: location.lng,
              timestamp: location.timestamp,
              source: 'polling',
            },
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error(`[RealtimeTracking] Error polling ${driver_id}:`, error);
      }
    }
  }

  /**
   * Stop polling fallback
   */
  private stopPollingFallback(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.pollingActive = false;
      console.info('[RealtimeTracking] Stopped polling fallback');
    }
  }

  /**
   * Subscribe to driver location updates
   */
  subscribe(driver_id: string, listener: RealtimeEventListener): () => void {
    // Add to watched drivers
    this.watchedDrivers.add(driver_id);

    // Add listener
    const unsubscribe = this.wsManager?.addEventListener(listener) || (() => {});

    // Also listen to polling updates
    const pollingListener = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { driver_id: eventDriver } = event.detail;
        if (eventDriver === driver_id) {
          listener({
            type: 'location_update',
            driver_id,
            data: event.detail,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    window.addEventListener('realtime_location_update', pollingListener);

    // Return cleanup function
    return () => {
      unsubscribe();
      window.removeEventListener('realtime_location_update', pollingListener);
      this.watchedDrivers.delete(driver_id);
    };
  }

  /**
   * Broadcast location update (for simulation/testing)
   */
  broadcastUpdate(update: DriverLocationUpdate): void {
    try {
      const validated = DriverLocationUpdateSchema.parse(update);

      // Construct strongly-typed location data
      const locationData: DriverLocationUpdate = {
        driver_id: String(validated.driver_id),
        lat: Number(validated.lat),
        lng: Number(validated.lng),
        timestamp: String(validated.timestamp),
        ...(validated.speed !== undefined && { speed: validated.speed }),
        ...(validated.heading !== undefined && { heading: validated.heading }),
        ...(validated.accuracy !== undefined && { accuracy: validated.accuracy }),
        ...(validated.trip_id !== undefined && { trip_id: validated.trip_id }),
      };

      const event = new CustomEvent('realtime_location_update', {
        detail: locationData,
      });
      window.dispatchEvent(event);

      // Also cache in TrackingService
      TrackingService.updateDriverLocation({
        driver_id: locationData.driver_id,
        lat: locationData.lat,
        lng: locationData.lng,
        timestamp: locationData.timestamp,
      }).catch((error) => {
        console.error('[RealtimeTracking] Error caching update:', error);
      });
    } catch (error) {
      console.error('[RealtimeTracking] Invalid location update:', error);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats | null {
    return this.wsManager?.getStats() ?? {
      isConnected: false,
      messagesReceived: 0,
      messagesSent: 0,
      uptime: 0,
      reconnectCount: 0,
    };
  }

  /**
   * Check if using WebSocket or polling
   */
  isUsingWebSocket(): boolean {
    return this.wsManager?.isFallbackMode() === false;
  }

  /**
   * Cleanup and disconnect
   */
  destroy(): void {
    this.wsManager?.disconnect();
    this.stopPollingFallback();
    this.watchedDrivers.clear();
    console.info('[RealtimeTracking] Service destroyed');
  }
}

// Export singleton
export const realtimeTrackingService = RealtimeTrackingService.getInstance();
