/**
 * Mock WebSocket Server for Development & Testing
 * Simulates real-time location updates from multiple drivers
 * 
 * Usage:
 * const server = new MockWebSocketServer();
 * server.start();
 * // Browser connects to ws://localhost:8765
 * server.stop();
 */

import { DriverLocationUpdate } from './realtimeTrackingService';

export interface MockDriverSimulator {
  driver_id: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  isActive: boolean;
}

export class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set();
  private simulators: Map<string, MockDriverSimulator> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private port: number;

  constructor(port: number = 8765) {
    this.port = port;
    this.initializeSimulators();
  }

  /**
   * Initialize driver simulators with random positions
   */
  private initializeSimulators(): void {
    const drivers = [
      'DRV-001',
      'DRV-002',
      'DRV-003',
      'DRV-004',
      'DRV-005',
    ];

    drivers.forEach((driver_id, index) => {
      this.simulators.set(driver_id, {
        driver_id,
        lat: -6.2088 + Math.random() * 0.05, // Jakarta area
        lng: 106.8456 + Math.random() * 0.05,
        speed: 20 + Math.random() * 40, // 20-60 km/h
        heading: Math.random() * 360,
        isActive: Math.random() > 0.3, // 70% active
      });
    });

    console.info(
      `[MockWebSocketServer] Initialized ${drivers.length} drivers`
    );
  }

  /**
   * Start the mock server
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[MockWebSocketServer] Already running');
      return;
    }

    this.isRunning = true;
    console.info(
      `[MockWebSocketServer] Starting on ws://localhost:${this.port}`
    );

    // Start updates every 2 seconds
    this.updateInterval = setInterval(() => {
      this.updateAndBroadcast();
    }, 2000);

    // For testing without actual WebSocket server, use CustomEvents
    this.simulateCustomEvents();
  }

  /**
   * Update driver positions and broadcast to all clients
   */
  private updateAndBroadcast(): void {
    const updates: DriverLocationUpdate[] = [];

    this.simulators.forEach((simulator) => {
      if (!simulator.isActive) return;

      // Simulate movement (random walk)
      simulator.lat += (Math.random() - 0.5) * 0.001; // ~100 meters
      simulator.lng += (Math.random() - 0.5) * 0.001;
      simulator.speed = Math.max(0, simulator.speed + (Math.random() - 0.5) * 5);
      simulator.heading = (simulator.heading + (Math.random() - 0.5) * 10) % 360;

      // Clamp to Jakarta area
      simulator.lat = Math.max(-6.3, Math.min(-6.1, simulator.lat));
      simulator.lng = Math.max(106.7, Math.min(106.9, simulator.lng));

      const update: DriverLocationUpdate = {
        driver_id: simulator.driver_id,
        lat: simulator.lat,
        lng: simulator.lng,
        timestamp: new Date().toISOString(),
        speed: parseFloat(simulator.speed.toFixed(1)),
        heading: Math.round(simulator.heading),
        accuracy: 5 + Math.random() * 5,
      };

      updates.push(update);
    });

    // Broadcast to all connected clients
    this.broadcast(updates);
  }

  /**
   * Simulate WebSocket messages using CustomEvents
   * This works without an actual WebSocket server for development/testing
   */
  private simulateCustomEvents(): void {
    setInterval(() => {
      const updates: DriverLocationUpdate[] = [];

      this.simulators.forEach((simulator) => {
        if (!simulator.isActive) return;

        // Simulate movement
        simulator.lat += (Math.random() - 0.5) * 0.001;
        simulator.lng += (Math.random() - 0.5) * 0.001;
        simulator.speed = Math.max(0, simulator.speed + (Math.random() - 0.5) * 5);
        simulator.heading = (simulator.heading + (Math.random() - 0.5) * 10) % 360;

        // Clamp to reasonable bounds
        simulator.lat = Math.max(-6.3, Math.min(-6.1, simulator.lat));
        simulator.lng = Math.max(106.7, Math.min(106.9, simulator.lng));

        const update: DriverLocationUpdate = {
          driver_id: simulator.driver_id,
          lat: simulator.lat,
          lng: simulator.lng,
          timestamp: new Date().toISOString(),
          speed: parseFloat(simulator.speed.toFixed(1)),
          heading: Math.round(simulator.heading),
          accuracy: 5 + Math.random() * 5,
        };

        updates.push(update);
      });

      // Dispatch CustomEvents for each update
      updates.forEach((update) => {
        const event = new CustomEvent('mock_driver_location_update', {
          detail: update,
        });
        window.dispatchEvent(event);
      });
    }, 2000);
  }

  /**
   * Broadcast updates to all connected clients
   */
  private broadcast(updates: DriverLocationUpdate[]): void {
    const message = JSON.stringify({
      type: 'location_batch',
      data: updates,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('[MockWebSocketServer] Send error:', error);
        }
      }
    });
  }

  /**
   * Update a specific driver's status
   */
  updateDriver(driver_id: string, isActive: boolean): void {
    const simulator = this.simulators.get(driver_id);
    if (simulator) {
      simulator.isActive = isActive;
      console.info(`[MockWebSocketServer] Updated ${driver_id} - active: ${isActive}`);
    }
  }

  /**
   * Get current driver position
   */
  getDriverLocation(driver_id: string): DriverLocationUpdate | null {
    const simulator = this.simulators.get(driver_id);
    if (!simulator) return null;

    return {
      driver_id: simulator.driver_id,
      lat: simulator.lat,
      lng: simulator.lng,
      timestamp: new Date().toISOString(),
      speed: simulator.speed,
      heading: simulator.heading,
    };
  }

  /**
   * Get all driver positions
   */
  getAllDriverLocations(): DriverLocationUpdate[] {
    return Array.from(this.simulators.values())
      .filter((sim) => sim.isActive)
      .map((sim) => ({
        driver_id: sim.driver_id,
        lat: sim.lat,
        lng: sim.lng,
        timestamp: new Date().toISOString(),
        speed: sim.speed,
        heading: sim.heading,
      }));
  }

  /**
   * Stop the mock server
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('[MockWebSocketServer] Not running');
      return;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.clients.forEach((client) => {
      try {
        client.close();
      } catch (error) {
        console.error('[MockWebSocketServer] Error closing client:', error);
      }
    });

    this.clients.clear();
    this.isRunning = false;
    console.info('[MockWebSocketServer] Stopped');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
      activeDrivers: Array.from(this.simulators.values()).filter(
        (s) => s.isActive
      ).length,
      totalDrivers: this.simulators.size,
    };
  }
}

// Export global instance for easy testing
export const mockWsServer = new MockWebSocketServer();
