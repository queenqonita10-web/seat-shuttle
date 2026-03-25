import React, { createContext, useContext, useState, ReactNode } from "react";
import { PickupPoint, Trip, Booking } from "@/data/mockData";

interface BookingState {
  pickupPoint: PickupPoint | null;
  destination: string;
  date: Date | null;
  selectedTrip: Trip | null;
  selectedSeat: string | null;
  booking: Booking | null;
}

interface BookingContextType extends BookingState {
  setPickupPoint: (p: PickupPoint | null) => void;
  setDestination: (d: string) => void;
  setDate: (d: Date | null) => void;
  setSelectedTrip: (t: Trip | null) => void;
  setSelectedSeat: (s: string | null) => void;
  setBooking: (b: Booking | null) => void;
  reset: () => void;
}

const initial: BookingState = {
  pickupPoint: null,
  destination: "",
  date: null,
  selectedTrip: null,
  selectedSeat: null,
  booking: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initial);

  const value: BookingContextType = {
    ...state,
    setPickupPoint: (p) => setState((s) => ({ ...s, pickupPoint: p })),
    setDestination: (d) => setState((s) => ({ ...s, destination: d })),
    setDate: (d) => setState((s) => ({ ...s, date: d })),
    setSelectedTrip: (t) => setState((s) => ({ ...s, selectedTrip: t })),
    setSelectedSeat: (s) => setState((prev) => ({ ...prev, selectedSeat: s })),
    setBooking: (b) => setState((s) => ({ ...s, booking: b })),
    reset: () => setState(initial),
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
