/**
 * Notification Service
 * Handles push notifications for location updates, arrivals, and alerts
 * 
 * Features:
 * - Browser Notification API integration
 * - SMS notifications (simulated for development)
 * - Toast-style in-app notifications
 * - Notification history & deduplication
 * - Permission management
 */

import { z } from 'zod';

// ==================== TYPES ====================

export type NotificationType = 
  | 'arrival'           // Driver will arrive at pickup
  | 'arrived'           // Driver has arrived
  | 'nearby'            // Driver is getting close (5 min away)
  | 'status_change'     // Trip status changed
  | 'incident'          // Traffic/weather/accident warning
  | 'payment_required'  // Payment confirmation needed
  | 'reminder';         // General reminders

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  icon?: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string; // For grouping similar notifications
  requireInteraction?: boolean;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  soundEnabled?: boolean;
}

export interface SMSNotificationOptions {
  phoneNumber?: string;
  message: string;
}

export interface NotificationPreferences {
  browser: boolean;
  sms: boolean;
  inApp: boolean;
  sound: boolean;
  vibration: boolean;
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
  };
}

// ==================== ZODI SCHEMA ====================

const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['arrival', 'arrived', 'nearby', 'status_change', 'incident', 'payment_required', 'reminder']),
  title: z.string(),
  body: z.string(),
  timestamp: z.string().datetime(),
  read: z.boolean(),
  data: z.record(z.any()).optional(),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    icon: z.string().optional(),
  })).optional(),
});

// ==================== CONSTANTS ====================

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==';
const DEFAULT_PREFERENCES: NotificationPreferences = {
  browser: true,
  sms: false,
  inApp: true,
  sound: true,
  vibration: true,
  quiet_hours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// ==================== NOTIFICATION SERVICE ====================

export class NotificationService {
  private static instance: NotificationService | null = null;
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notification: Notification) => void> = new Set();
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private notificationHistory: Set<string> = new Set(); // For deduplication
  private phoneNumber: string = ''; // For SMS notifications

  private constructor() {
    this.loadPreferences();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request browser notification permission
      if (this.preferences.browser && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      console.info('[NotificationService] Initialized');
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('notification_preferences');
      if (saved) {
        this.preferences = JSON.parse(saved);
      }
      
      const phone = localStorage.getItem('phone_number');
      if (phone) {
        this.phoneNumber = phone;
      }
    } catch (error) {
      console.warn('[NotificationService] Error loading preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('[NotificationService] Error saving preferences:', error);
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update notification preferences
   */
  setPreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    console.info('[NotificationService] Preferences updated', this.preferences);
  }

  /**
   * Set phone number for SMS notifications
   */
  setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
    localStorage.setItem('phone_number', phoneNumber);
  }

  /**
   * Check if in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.quiet_hours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const { start, end } = this.preferences.quiet_hours;

    // Simple comparison (doesn't handle midnight wrap-around)
    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      return currentTime >= start || currentTime < end;
    }
  }

  /**
   * Generate unique notification ID for deduplication
   */
  private generateNotificationKey(type: NotificationType, data?: Record<string, any>): string {
    return `${type}:${JSON.stringify(data || {})}:${Math.floor(Date.now() / 60000)}`; // Per-minute dedup
  }

  /**
   * Send browser notification
   */
  private async sendBrowserNotification(options: NotificationOptions): Promise<void> {
    if (!this.preferences.browser || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('[NotificationService] Browser notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
      } as NotificationOptions);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Play sound if enabled
      if (options.soundEnabled && this.preferences.sound) {
        this.playNotificationSound();
      }

      // Vibrate if enabled
      if (this.preferences.vibration && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      console.info('[NotificationService] Browser notification sent:', options.title);
    } catch (error) {
      console.error('[NotificationService] Error sending browser notification:', error);
    }
  }

  /**
   * Send SMS notification (simulated)
   */
  private async sendSMSNotification(options: SMSNotificationOptions): Promise<void> {
    if (!this.preferences.sms) {
      return;
    }

    if (!this.phoneNumber && !options.phoneNumber) {
      console.warn('[NotificationService] Phone number not set for SMS');
      return;
    }

    try {
      // In production, this would send via Twilio, AWS SNS, or similar
      const phoneNumber = options.phoneNumber || this.phoneNumber;
      
      console.info('[NotificationService] SMS sent to', phoneNumber, ':', options.message);

      // Simulate SMS delivery delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, you'd send to backend:
      // await fetch('/api/notifications/sms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, message: options.message }),
      // });
    } catch (error) {
      console.error('[NotificationService] Error sending SMS:', error);
    }
  }

  /**
   * Dispatch in-app notification
   */
  private dispatchInAppNotification(notification: Notification): void {
    if (!this.preferences.inApp) {
      return;
    }

    this.notifications.set(notification.id, notification);
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('[NotificationService] Listener error:', error);
      }
    });
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.play().catch((error) => {
        console.warn('[NotificationService] Error playing sound:', error);
      });
    } catch (error) {
      console.error('[NotificationService] Sound playback error:', error);
    }
  }

  /**
   * Send a notification of a specific type
   */
  async send(type: NotificationType, options: NotificationOptions): Promise<Notification | null> {
    // Check quiet hours
    if (this.isInQuietHours() && !options.requireInteraction) {
      console.info('[NotificationService] Quiet hours active, skipping notification');
      return null;
    }

    // Deduplication check
    const notificationKey = this.generateNotificationKey(type, options.data);
    if (this.notificationHistory.has(notificationKey)) {
      console.info('[NotificationService] Notification deduplicated:', type);
      return null;
    }

    this.notificationHistory.add(notificationKey);

    // Generate notification ID
    const id = `${type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    // Create notification object
    const notification: Notification = {
      id,
      type,
      title: options.title,
      body: options.body,
      timestamp: new Date().toISOString(),
      read: false,
      data: options.data,
      actions: options.actions,
    };

    // Validate
    try {
      NotificationSchema.parse(notification);
    } catch (error) {
      console.error('[NotificationService] Invalid notification:', error);
      return null;
    }

    // Send via all enabled channels
    await this.sendBrowserNotification(options);
    this.dispatchInAppNotification(notification);

    // Archive notification
    this.notifications.set(id, notification);

    console.info('[NotificationService] Notification sent:', type, options.title);

    return notification;
  }

  /**
   * Send arrival notification
   */
  async sendArrivalNotification(driverId: string, eta: number, pickup: string): Promise<Notification | null> {
    return this.send('arrival', {
      title: 'Driver Arriving Soon',
      body: `Driver ${driverId} will arrive at ${pickup} in ${eta} minutes`,
      icon: '🚐',
      tag: `arrival:${driverId}`,
      data: { driverId, eta, pickup },
      soundEnabled: true,
    });
  }

  /**
   * Send arrived notification
   */
  async sendArrivedNotification(driverId: string, pickup: string): Promise<Notification | null> {
    return this.send('arrived', {
      title: '🎉 Driver Has Arrived!',
      body: `Your driver is waiting at ${pickup}`,
      icon: '✓',
      tag: `arrived:${driverId}`,
      requireInteraction: true,
      data: { driverId, pickup },
      soundEnabled: true,
    });
  }

  /**
   * Send nearby notification (5 min away)
   */
  async sendNearbyNotification(driverId: string, pickup: string): Promise<Notification | null> {
    return this.send('nearby', {
      title: 'Driver Getting Close',
      body: `Driver ${driverId} is about 5 minutes away from ${pickup}`,
      icon: '📍',
      tag: `nearby:${driverId}`,
      data: { driverId, pickup },
      soundEnabled: false,
    });
  }

  /**
   * Send status change notification
   */
  async sendStatusChangeNotification(status: string, details: string): Promise<Notification | null> {
    return this.send('status_change', {
      title: 'Trip Status Updated',
      body: details,
      icon: 'ℹ️',
      tag: `status:${status}`,
      data: { status, details },
      soundEnabled: false,
    });
  }

  /**
   * Send incident notification (traffic, weather, etc)
   */
  async sendIncidentNotification(incident: string, recommendation: string): Promise<Notification | null> {
    return this.send('incident', {
      title: '⚠️ ' + incident,
      body: recommendation,
      icon: '⚠️',
      tag: `incident:${incident}`,
      requireInteraction: true,
      data: { incident, recommendation },
      soundEnabled: true,
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(): Promise<Notification | null> {
    return this.send('payment_required', {
      title: 'Payment Confirmation',
      body: 'Please confirm payment for your trip',
      icon: '💳',
      tag: 'payment',
      requireInteraction: true,
      soundEnabled: true,
    });
  }

  /**
   * Subscribe to notification events
   */
  subscribe(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get notification history
   */
  getNotifications(unreadOnly: boolean = false): Notification[] {
    const notifications = Array.from(this.notifications.values());
    return unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter((n) => !n.read).length;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.listeners.clear();
    this.notifications.clear();
    this.notificationHistory.clear();
    console.info('[NotificationService] Destroyed');
  }
}

// Export singleton
export const notificationService = NotificationService.getInstance();
