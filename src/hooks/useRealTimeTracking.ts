/**
 * Hook for Real-time Location Tracking
 * Provides reactive access to driver location updates via WebSocket
 * 
 * Usage:
 * const { location, isConnected, error } = useRealTimeTracking(driver_id);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  realtimeTrackingService,
  DriverLocationUpdate,
  RealtimeEvent,
  ConnectionStats,
} from '@/services/realtimeTrackingService';

export interface UseRealTimeTrackingOptions {
  /**
   * Automatically subscribe on mount, unsubscribe on unmount
   * @default true
   */
  autoSubscribe?: boolean;

  /**
   * Callback when location updates
   */
  onLocationUpdate?: (location: DriverLocationUpdate) => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: string) => void;

  /**
   * Callback when connection status changes
   */
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface UseRealTimeTrackingResult {
  // Current location
  location: DriverLocationUpdate | null;

  // Connection status
  isConnected: boolean;
  isWebSocket: boolean;

  // Error state
  error: string | null;

  // Statistics
  stats: ConnectionStats | null;

  // Manual controls
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * Hook for monitoring real-time driver location
 */
export const useRealTimeTracking = (
  driver_id: string | null,
  options: UseRealTimeTrackingOptions = {}
): UseRealTimeTrackingResult => {
  const {
    autoSubscribe = true,
    onLocationUpdate,
    onError,
    onConnectionChange,
  } = options;

  // State
  const [location, setLocation] = useState<DriverLocationUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWebSocket, setIsWebSocket] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ConnectionStats | null>(null);

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const subscriptionRef = useRef<boolean>(false);

  /**
   * Handle real-time events from service
   */
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      try {
        switch (event.type) {
          case 'location_update':
            if (event.data) {
              setLocation(event.data);
              onLocationUpdate?.(event.data);
            }
            break;

          case 'connection_open':
            setIsConnected(true);
            setError(null);
            setIsWebSocket(true);
            onConnectionChange?.(true);
            break;

          case 'connection_close':
            setIsConnected(false);
            onConnectionChange?.(false);
            break;

          case 'error':
            setError(event.error ?? 'Unknown error');
            onError?.(event.error ?? 'Unknown error');
            setIsWebSocket(false);
            break;

          case 'subscribed':
            console.info(`[useRealTimeTracking] Subscribed to ${event.driver_id}`);
            subscriptionRef.current = true;
            break;

          case 'unsubscribed':
            console.info(`[useRealTimeTracking] Unsubscribed from ${event.driver_id}`);
            subscriptionRef.current = false;
            break;
        }

        // Update stats
        const serviceStats = realtimeTrackingService.getStats();
        setStats(serviceStats);
      } catch (error) {
        console.error('[useRealTimeTracking] Handler error:', error);
        setError(`Handler error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [onLocationUpdate, onError, onConnectionChange]
  );

  /**
   * Subscribe to driver location
   */
  const subscribe = useCallback(() => {
    if (!driver_id || subscriptionRef.current) {
      return;
    }

    console.info(`[useRealTimeTracking] Subscribing to ${driver_id}`);
    unsubscribeRef.current = realtimeTrackingService.subscribe(
      driver_id,
      handleRealtimeEvent
    );
    subscriptionRef.current = true;
  }, [driver_id, handleRealtimeEvent]);

  /**
   * Unsubscribe from driver location
   */
  const unsubscribe = useCallback(() => {
    if (!subscriptionRef.current) {
      return;
    }

    console.info(`[useRealTimeTracking] Unsubscribing from ${driver_id}`);
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    subscriptionRef.current = false;
    setLocation(null);
  }, [driver_id]);

  /**
   * Setup/teardown subscription
   */
  useEffect(() => {
    if (!driver_id) {
      unsubscribe();
      return;
    }

    if (autoSubscribe) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      if (autoSubscribe) {
        unsubscribe();
      }
    };
  }, [driver_id, autoSubscribe, subscribe, unsubscribe]);

  /**
   * Update WebSocket status
   */
  useEffect(() => {
    const isWS = realtimeTrackingService.isUsingWebSocket();
    setIsWebSocket(isWS);
  }, []);

  return {
    location,
    isConnected,
    isWebSocket,
    error,
    stats,
    subscribe,
    unsubscribe,
  };
};

/**
 * Hook for tracking multiple drivers
 * Returns updated locations for all drivers
 */
export const useMultipleRealTimeTracking = (
  driver_ids: string[],
  options: UseRealTimeTrackingOptions = {}
) => {
  const [locations, setLocations] = useState<Record<string, DriverLocationUpdate>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Subscribe to all drivers
  useEffect(() => {
    // Cleanup previous subscriptions
    unsubscribesRef.current.forEach((unsub) => unsub());
    unsubscribesRef.current = [];

    // Subscribe to each driver
    driver_ids.forEach((driver_id) => {
      const unsub = realtimeTrackingService.subscribe(driver_id, (event) => {
        if (event.type === 'location_update' && event.data) {
          setLocations((prev) => ({
            ...prev,
            [event.driver_id!]: event.data!,
          }));
        } else if (event.type === 'error') {
          setError(event.error ?? null);
        } else if (event.type === 'connection_open') {
          setIsConnected(true);
          setError(null);
        } else if (event.type === 'connection_close') {
          setIsConnected(false);
        }
      });

      unsubscribesRef.current.push(unsub);
    });

    // Cleanup
    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
    };
  }, [driver_ids]);

  return {
    locations,
    isConnected,
    error,
  };
};

/**
 * Hook for debugging real-time tracking connection
 */
export const useRealTimeTrackingDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    isConnected: false,
    isWebSocket: false,
    stats: realtimeTrackingService.getStats(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo({
        isConnected:
          realtimeTrackingService.getStats()?.isConnected ?? false,
        isWebSocket: realtimeTrackingService.isUsingWebSocket(),
        stats: realtimeTrackingService.getStats(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return debugInfo;
};
