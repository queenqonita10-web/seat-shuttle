import React, { createContext, useContext, useState, ReactNode } from "react";
import { Trip, Booking, getBookingsForTrip } from "@/data/mockData";

interface DriverState {
  activeTrip: Trip | null;
  currentStopIndex: number;
  bookings: Booking[];
  isOnline: boolean;
  isDrivingMode: boolean; // Added for driving-specific UI
  voiceActive: boolean;   // Added for voice simulation
}

interface DriverType extends DriverState {
  setActiveTrip: (trip: Trip | null) => void;
  setCurrentStopIndex: (index: number) => void;
  updateBookingStatus: (bookingId: string, status: "pending" | "picked_up" | "no_show") => void;
  setIsOnline: (online: boolean) => void;
  setIsDrivingMode: (mode: boolean) => void;
  setVoiceActive: (active: boolean) => void;
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

  const playFeedback = (type: "success" | "error" | "action") => {
    // In real app, this would use Web Audio API or play a sound file
    console.log(`[Audio Feedback] ${type}`);
    // Simulate audio feedback with vibration if supported
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
        setActiveTrip,
        setCurrentStopIndex,
        updateBookingStatus,
        setIsOnline,
        setIsDrivingMode,
        setVoiceActive,
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
