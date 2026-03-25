import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TrackingService } from "@/services/trackingService";
import { supabase } from "@/integrations/supabase/client";

// DB-compatible types
export interface DriverTrip {
  id: string;
  route_id: string;
  departure_time: string;
  vehicle_type_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  status: string;
  departure_date: string;
  seats: { id: string; seat_number: string; row_num: number; col_num: number; status: string }[];
}

export interface DriverBooking {
  id: string;
  trip_id: string;
  seat_number: string;
  pickup_point_id: string;
  passenger_name: string;
  passenger_phone: string;
  payment_method: string;
  payment_status: string;
  status: string;
  fare: number;
  created_at: string;
}

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
  reactionTime: number;
  decisionAccuracy: number;
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
  activeTrip: DriverTrip | null;
  currentStopIndex: number;
  bookings: DriverBooking[];
  isOnline: boolean;
  isDrivingMode: boolean;
  voiceActive: boolean;
  trafficLevel: TrafficLevel;
  weather: Weather;
  stressLevel: number;
  fatigueLevel: number;
  difficulty: SimulationDifficulty;
  performance: DriverPerformance;
  activeEvents: SimulationEvent[];
  etaAdjustment: number;
  incidentReports: IncidentReport[];
  locationVerified: boolean;
  scheduleDeviation: number;
  waitLimit: number;
  currentLocation: { lat: number; lng: number; lastUpdate: string } | null;
}

interface DriverType extends DriverState {
  setActiveTrip: (trip: DriverTrip | null) => void;
  setCurrentStopIndex: (index: number) => void;
  updateBookingStatus: (bookingId: string, status: "pending" | "picked_up" | "no_show") => void;
  setIsOnline: (online: boolean) => void;
  setIsDrivingMode: (mode: boolean) => void;
  setVoiceActive: (active: boolean) => void;
  setTrafficLevel: (level: TrafficLevel) => void;
  setWeather: (weather: Weather) => void;
  addEvent: (event: SimulationEvent) => void;
  resolveEvent: (id: string) => void;
  updatePerformance: (update: Partial<DriverPerformance>) => void;
  setDifficulty: (diff: SimulationDifficulty) => void;
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
  const [activeTrip, setActiveTripState] = useState<DriverTrip | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isDrivingMode, setIsDrivingMode] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);

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

  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [locationVerified, setLocationVerified] = useState(false);
  const [scheduleDeviation, setScheduleDeviation] = useState(0);
  const [waitLimit, setWaitLimit] = useState(5);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; lastUpdate: string } | null>(null);

  useEffect(() => {
    if (!activeTrip) return;
    const timer = setInterval(() => {
      setFatigueLevel((prev) => Math.min(100, prev + (difficulty === "pro" ? 0.5 : 0.2)));
      const trafficStress = trafficLevel === "rush_hour" ? 1.5 : trafficLevel === "high" ? 1 : 0.2;
      const eventStress = activeEvents.reduce((acc, e) => acc + e.impact.stress, 0);
      setStressLevel((prev) => Math.max(0, Math.min(100, prev + trafficStress + eventStress - 0.1)));
    }, 2000);
    return () => clearInterval(timer);
  }, [activeTrip, trafficLevel, activeEvents, difficulty]);

  useEffect(() => {
    if (!activeTrip || !isDrivingMode) return;
    let lat = -6.2088;
    let lng = 106.8456;
    const moveInterval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      updateLocation(lat, lng);
    }, 5000);
    return () => clearInterval(moveInterval);
  }, [activeTrip, isDrivingMode]);

  const playFeedback = (type: "success" | "error" | "action") => {
    if ("vibrate" in navigator) {
      if (type === "success") navigator.vibrate([10, 30, 10]);
      if (type === "error") navigator.vibrate([100, 50, 100]);
      if (type === "action") navigator.vibrate(20);
    }
  };

  const setActiveTrip = async (trip: DriverTrip | null) => {
    setActiveTripState(trip);
    if (trip) {
      // Fetch bookings from DB
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("trip_id", trip.id);
      setBookings((data ?? []) as DriverBooking[]);
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
    setCurrentLocation({ lat, lng, lastUpdate: timestamp });
    if (activeTrip) {
      try {
        await TrackingService.updateDriverLocation({
          driver_id: activeTrip.driver_id || "driver-unknown",
          lat,
          lng,
          timestamp,
        });
      } catch (error) {
        console.error("[Tracking Error]", error);
      }
    }
  };

  const nextStop = () => { setCurrentStopIndex((prev) => prev + 1); playFeedback("action"); };
  const prevStop = () => { setCurrentStopIndex((prev) => Math.max(0, prev - 1)); playFeedback("action"); };

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
        activeTrip, currentStopIndex, bookings, isOnline, isDrivingMode, voiceActive,
        trafficLevel, weather, stressLevel, fatigueLevel, difficulty, performance,
        activeEvents, etaAdjustment, incidentReports, locationVerified, scheduleDeviation,
        waitLimit, currentLocation,
        setActiveTrip, setCurrentStopIndex, updateBookingStatus, setIsOnline, setIsDrivingMode,
        setVoiceActive, setTrafficLevel, setWeather, addEvent, resolveEvent, updatePerformance,
        setDifficulty, addIncidentReport, setLocationVerified, setScheduleDeviation, setWaitLimit,
        updateLocation, nextStop, prevStop, reset, playFeedback,
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
