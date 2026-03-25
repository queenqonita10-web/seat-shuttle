import React, { createContext, useContext, useState, ReactNode } from "react";

// DB-compatible types for booking flow
export interface BookingPickupPoint {
  id: string;
  label: string;
  sort_order: number;
  time_offset: number;
  fare: number;
}

export interface BookingSeat {
  id: string;
  seat_number: string;
  row_num: number;
  col_num: number;
  status: string;
}

export interface BookingTrip {
  id: string;
  route_id: string;
  departure_time: string;
  vehicle_type_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  status: string;
  departure_date: string;
  seats: BookingSeat[];
}

export interface BookingData {
  id: string;
  tripId: string;
  seatNumber: string;
  pickupPointId: string;
  passengerName: string;
  passengerPhone: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  fare: number;
  createdAt: string;
}

interface BookingState {
  pickupPoint: BookingPickupPoint | null;
  destination: string;
  date: Date | null;
  selectedTrip: BookingTrip | null;
  selectedSeat: string | null;
  passengerName: string;
  passengerPhone: string;
  booking: BookingData | null;
}

interface BookingContextType extends BookingState {
  setPickupPoint: (p: BookingPickupPoint | null) => void;
  setDestination: (d: string) => void;
  setDate: (d: Date | null) => void;
  setSelectedTrip: (t: BookingTrip | null) => void;
  setSelectedSeat: (s: string | null) => void;
  setPassengerName: (n: string) => void;
  setPassengerPhone: (p: string) => void;
  setBooking: (b: BookingData | null) => void;
  reset: () => void;
}

const initial: BookingState = {
  pickupPoint: null,
  destination: "",
  date: null,
  selectedTrip: null,
  selectedSeat: null,
  passengerName: "",
  passengerPhone: "",
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
    setPassengerName: (n) => setState((s) => ({ ...s, passengerName: n })),
    setPassengerPhone: (p) => setState((s) => ({ ...s, passengerPhone: p })),
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
