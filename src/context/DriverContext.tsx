import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Trip, Booking, getBookingsForTrip } from "@/data/mockData";
import { TrackingService } from "@/services/trackingService";

export type TrafficLevel = "low" | "medium" | "high" | "rush_hour";
export type Weather = "clear" | "rain" | "fog" | "storm";
export type SimulationDifficulty = "easy" | "normal" | "hard" | "pro";

interface SimulationEvent {
  id: string;
  type: "road_hazard" | "passenger_request" | "detour" | "police_check";
  message: string;
  impact: { stress: number; time: number };
}

interface DriverPerformance {
  reactionTime: number; // in ms
  decisionAccuracy: number; // percentage
  totalScore: number;
}

interface IncidentReport {
  id: string;
  bookingId: string;
  type: "no_show" | "late_arrival" | "location_mismatch" | "conflict";
  timestamp: string;
  details: string;
  resolved: boolean;
}

interface DriverState {
  activeTrip: Trip | null;
  currentStopIndex: number;
  bookings: Booking[];
  isOnline: boolean;
  isDrivingMode: boolean;
  voiceActive: boolean;
  // Simulation States
  trafficLevel: TrafficLevel;
  weather: Weather;
  stressLevel: number; // 0-100
  fatigueLevel: number; // 0-100
  difficulty: SimulationDifficulty;
  performance: DriverPerformance;
  activeEvents: SimulationEvent[];
  etaAdjustment: number; // in minutes
  // Edge Case States
  incidentReports: IncidentReport[];
  locationVerified: boolean;
  scheduleDeviation: number; // in minutes (positive for late, negative for early)
  waitLimit: number; // in minutes (configurable 5-15)
  currentLocation: { lat: number; lng: number; lastUpdate: string } | null;
}

interface DriverType extends DriverState {
  setActiveTrip: (trip: Trip | null) => void;
  setCurrentStopIndex: (index: number) => void;
  updateBookingStatus: (bookingId: string, status: "pending" | "picked_up" | "no_show") => void;
  setIsOnline: (online: boolean) => void;
  setIsDrivingMode: (mode: boolean) => void;
  setVoiceActive: (active: boolean) => void;
  // Simulation Controls
  setTrafficLevel: (level: TrafficLevel) => void;
  setWeather: (weather: Weather) => void;
  addEvent: (event: SimulationEvent) => void;
  resolveEvent: (id: string) => void;
  updatePerformance: (update: Partial<DriverPerformance>) => void;
  setDifficulty: (diff: SimulationDifficulty) => void;
  // Edge Case Controls
  addIncidentReport: (report: IncidentReport) => void;
  setLocationVerified: (verified: boolean) => void;
  setScheduleDeviation: (deviation: number) => void;
  setWaitLimit: (limit: number) => void;
  updateLocation: (lat: number, lng: number) => void;
  nextStop: () => void;
  prevStop: () => void;
  reset: () => void;
  playFeedback: (type: "success" | "error" | "action") => void;
}

const DriverContext = createContext<DriverType | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTripState] = useState<Trip | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isDrivingMode, setIsDrivingMode] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);

  // Simulation States
  const [trafficLevel, setTrafficLevel] = useState<TrafficLevel>("medium");
  const [weather, setWeather] = useState<Weather>("clear");
  const [stressLevel, setStressLevel] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState(0);
  const [difficulty, setDifficulty] = useState<SimulationDifficulty>("normal");
  const [performance, setPerformance] = useState<DriverPerformance>({
    reactionTime: 0,
    decisionAccuracy: 100,
    totalScore: 0,
  });
  const [activeEvents, setActiveEvents] = useState<SimulationEvent[]>([]);
  const [etaAdjustment, setEtaAdjustment] = useState(0);

  // Edge Case States
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [locationVerified, setLocationVerified] = useState(false);
  const [scheduleDeviation, setScheduleDeviation] = useState(0);
  const [waitLimit, setWaitLimit] = useState(5);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; lastUpdate: string } | null>(null);

  // Fatigue & Stress simulation over time
  useEffect(() => {
    if (!activeTrip) return;

    const timer = setInterval(() => {
      setFatigueLevel((prev) => Math.min(100, prev + (difficulty === "pro" ? 0.5 : 0.2)));
      
      // Stress increases with traffic and active events
      const trafficStress = trafficLevel === "rush_hour" ? 1.5 : trafficLevel === "high" ? 1 : 0.2;
      const eventStress = activeEvents.reduce((acc, e) => acc + e.impact.stress, 0);
      setStressLevel((prev) => Math.max(0, Math.min(100, prev + trafficStress + eventStress - 0.1)));
    }, 2000);

    return () => clearInterval(timer);
  }, [activeTrip, trafficLevel, activeEvents, difficulty]);

  // Real-time Location Simulation
  useEffect(() => {
    if (!activeTrip || !isDrivingMode) return;

    // Start with a base location (Jakarta area)
    let lat = -6.2088;
    let lng = 106.8456;

    const moveInterval = setInterval(() => {
      // Simulate small movement
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      
      updateLocation(lat, lng);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(moveInterval);
  }, [activeTrip, isDrivingMode]);

  const playFeedback = (type: "success" | "error" | "action") => {
    console.log(`[Audio Feedback] ${type}`);
    if ("vibrate" in navigator) {
      if (type === "success") navigator.vibrate([10, 30, 10]);
      if (type === "error") navigator.vibrate([100, 50, 100]);
      if (type === "action") navigator.vibrate(20);
    }
  };

  const setActiveTrip = (trip: Trip | null) => {
    setActiveTripState(trip);
    if (trip) {
      setBookings(getBookingsForTrip(trip.id));
      setCurrentStopIndex(0);
      setStressLevel(10);
      setFatigueLevel(5);
      setEtaAdjustment(0);
      setActiveEvents([]);
      setIncidentReports([]);
      setLocationVerified(false);
      setScheduleDeviation(0);
      playFeedback("success");
    } else {
      setBookings([]);
      setCurrentStopIndex(0);
    }
  };

  const updateBookingStatus = (bookingId: string, status: "pending" | "picked_up" | "no_show") => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    playFeedback(status === "picked_up" ? "success" : status === "no_show" ? "error" : "action");
  };

  const addEvent = (event: SimulationEvent) => {
    setActiveEvents((prev) => [...prev, event]);
    setEtaAdjustment((prev) => prev + event.impact.time);
    playFeedback("error");
  };

  const resolveEvent = (id: string) => {
    setActiveEvents((prev) => prev.filter((e) => e.id !== id));
    playFeedback("success");
  };

  const updatePerformance = (update: Partial<DriverPerformance>) => {
    setPerformance((prev) => ({ ...prev, ...update }));
  };

  const addIncidentReport = (report: IncidentReport) => {
    setIncidentReports((prev) => [...prev, report]);
  };

  const updateLocation = async (lat: number, lng: number) => {
    const timestamp = new Date().toISOString();
    const update = { lat, lng, lastUpdate: timestamp };
    setCurrentLocation(update);
    
    if (activeTrip) {
      try {
        await TrackingService.updateDriverLocation({
          driver_id: activeTrip.driverId || "driver-unknown",
          lat,
          lng,
          timestamp,
        });
      } catch (error) {
        console.error("[Tracking Error]", error);
      }
    }
  };

  const nextStop = () => {
    setCurrentStopIndex((prev) => prev + 1);
    playFeedback("action");
  };

  const prevStop = () => {
    setCurrentStopIndex((prev) => Math.max(0, prev - 1));
    playFeedback("action");
  };

  const reset = () => {
    setActiveTripState(null);
    setCurrentStopIndex(0);
    setBookings([]);
    setIsOnline(false);
    setStressLevel(0);
    setFatigueLevel(0);
    setActiveEvents([]);
    setIncidentReports([]);
    setLocationVerified(false);
    setScheduleDeviation(0);
    playFeedback("action");
  };

  return (
    <DriverContext.Provider
      value={{
        activeTrip,
        currentStopIndex,
        bookings,
        isOnline,
        isDrivingMode,
        voiceActive,
        trafficLevel,
        weather,
        stressLevel,
        fatigueLevel,
        difficulty,
        performance,
        activeEvents,
        etaAdjustment,
        incidentReports,
        locationVerified,
        scheduleDeviation,
        waitLimit,
        currentLocation,
        setActiveTrip,
        setCurrentStopIndex,
        updateBookingStatus,
        setIsOnline,
        setIsDrivingMode,
        setVoiceActive,
        setTrafficLevel,
        setWeather,
        addEvent,
        resolveEvent,
        updatePerformance,
        setDifficulty,
        addIncidentReport,
        setLocationVerified,
        setScheduleDeviation,
        setWaitLimit,
        updateLocation,
        nextStop,
        prevStop,
        reset,
        playFeedback,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used within DriverProvider");
  return ctx;
}
