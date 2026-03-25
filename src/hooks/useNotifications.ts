/**
 * Hook for Notification Management
 * Provides reactive access to in-app notifications
 * 
 * Usage:
 * const { notifications, unreadCount } = useNotifications();
 */

import { useState, useEffect, useCallback } from 'react';
import {
  notificationService,
  Notification,
  NotificationPreferences,
} from '@/services/notificationService';

export interface UseNotificationsResult {
  // Current notifications
  notifications: Notification[];
  unreadCount: number;
  unreadNotifications: Notification[];

  // UI state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Actions
  markAsRead: (id: string) => void;
  clearAll: () => void;
  
  // Preferences
  preferences: NotificationPreferences;
  setPreferences: (prefs: Partial<NotificationPreferences>) => void;
}

/**
 * Hook for managing notifications
 */
export const useNotifications = (): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setLocalPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );

  /**
   * Update internal state when notifications change
   */
  const updateNotifications = useCallback(() => {
    const all = notificationService.getNotifications(false);
    setNotifications(all);
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  /**
   * Initialize and subscribe to notifications
   */
  useEffect(() => {
    notificationService.initialize().catch((error) => {
      console.error('[useNotifications] Initialization error:', error);
    });

    // Subscribe to notification events
    const unsubscribe = notificationService.subscribe((notification: Notification) => {
      updateNotifications();
    });

    // Initial state
    updateNotifications();

    return () => {
      unsubscribe();
    };
  }, [updateNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    updateNotifications();
  }, [updateNotifications]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    notificationService.clearAll();
    updateNotifications();
  }, [updateNotifications]);

  /**
   * Update preferences
   */
  const setPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    notificationService.setPreferences(prefs);
    setLocalPreferences((prev) => ({ ...prev, ...prefs }));
  }, []);

  // Filter unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    isOpen,
    setIsOpen,
    markAsRead,
    clearAll,
    preferences,
    setPreferences,
  };
};

/**
 * Hook for tracking arrival notifications
 * Automatically triggers notifications based on distance
 */
export interface UseArrivalNotificationsOptions {
  eta?: number;
  distance?: number; // meters
  pickup?: string;
  driverId?: string;
}

export const useArrivalNotifications = (options: UseArrivalNotificationsOptions) => {
  const { eta = 999, distance = 999, pickup = 'pickup', driverId = 'driver' } = options;
  const [nearbyNotified, setNearbyNotified] = useState(false);
  const [arrivedNotified, setArrivedNotified] = useState(false);

  /**
   * Trigger notifications based on proximity
   */
  useEffect(() => {
    if (distance && distance < 1000 && !nearbyNotified) {
      // Within 1km - send nearby notification
      notificationService.sendNearbyNotification(driverId, pickup).catch(console.error);
      setNearbyNotified(true);
    }
  }, [distance, nearbyNotified, driverId, pickup]);

  useEffect(() => {
    if (distance && distance < 100 && !arrivedNotified) {
      // Within 100m - send arrived notification
      notificationService.sendArrivedNotification(driverId, pickup).catch(console.error);
      setArrivedNotified(true);
    }
  }, [distance, arrivedNotified, driverId, pickup]);

  useEffect(() => {
    if (eta && eta <= 5 && !nearbyNotified) {
      // ETA 5 minutes or less
      notificationService.sendArrivedNotification(driverId, pickup).catch(console.error);
      setNearbyNotified(true);
    }
  }, [eta, nearbyNotified, driverId, pickup]);

  return {
    nearbyNotified,
    arrivedNotified,
    reset: () => {
      setNearbyNotified(false);
      setArrivedNotified(false);
    },
  };
};
