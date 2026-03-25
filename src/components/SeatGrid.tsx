import { cn } from "@/lib/utils";
import { useState } from "react";

interface SeatData {
  id: string;
  seat_number: string;
  row_num: number;
  col_num: number;
  status: string;
}

interface SeatGridProps {
  seats: SeatData[];
  selectedSeat: string | null;
  onSelect: (seatNumber: string) => void;
  vehicleTypeId: string;
  vehicleName?: string;
  layout?: string[][];
}

export function SeatGrid({ seats, selectedSeat, onSelect, vehicleName = "Vehicle", layout }: SeatGridProps) {
  const [animating, setAnimating] = useState<string | null>(null);
  const available = seats.filter((s) => s.status === "available").length;

  const handleSelect = (seat: SeatData) => {
    if (seat.status === "booked") return;
    setAnimating(seat.seat_number);
    onSelect(seat.seat_number === selectedSeat ? "" : seat.seat_number);
    setTimeout(() => setAnimating(null), 250);
  };

  const getSeatForPosition = (row: number, col: number) =>
    seats.find((s) => s.row_num === row && s.col_num === col);

  // Fallback layout if none provided
  const defaultLayout: string[][] = layout || [
    ["seat", "empty", "driver"],
    ["seat", "seat", "seat"],
    ["seat", "seat", "seat"],
    ["seat", "seat", "seat"],
    ["baggage", "baggage", "baggage"],
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{vehicleName}</p>
        <p className="text-xs text-muted-foreground">{available} of {seats.length} seats available</p>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-pyugo-seat-available border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-pyugo-seat-booked" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      <div className="mx-auto max-w-[280px] rounded-2xl border bg-card p-4 shadow-sm">
        <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          ▲ Front
        </div>

        <div className="space-y-2">
          {defaultLayout.map((row, rowIdx) => {
            const isBaggageRow = row.every((c) => c === "baggage");

            if (isBaggageRow) {
              return (
                <div key={rowIdx} className="mt-2 rounded-lg bg-muted/60 border border-dashed border-border py-2 text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    🧳 Baggage
                  </span>
                </div>
              );
            }

            return (
              <div key={rowIdx} className="flex items-center justify-center gap-1.5">
                {row.map((cell, colIdx) => {
                  if (cell === "driver") {
                    return (
                      <div
                        key={colIdx}
                        className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <span className="text-[10px] font-semibold text-muted-foreground">🚌</span>
                      </div>
                    );
                  }

                  if (cell === "empty") {
                    return <div key={colIdx} className="h-10 w-10" />;
                  }

                  const seat = getSeatForPosition(rowIdx, colIdx);
                  if (!seat) return <div key={colIdx} className="h-10 w-10" />;

                  const isSelected = seat.seat_number === selectedSeat;
                  const isBooked = seat.status === "booked";

                  return (
                    <button
                      key={colIdx}
                      onClick={() => handleSelect(seat)}
                      disabled={isBooked}
                      className={cn(
                        "h-10 w-10 rounded-lg text-xs font-medium transition-all duration-150",
                        "flex items-center justify-center",
                        isBooked && "bg-pyugo-seat-booked cursor-not-allowed text-muted-foreground",
                        isSelected && "bg-primary text-primary-foreground shadow-md",
                        !isBooked && !isSelected && "bg-pyugo-seat-available border border-border hover:border-primary hover:bg-primary/10",
                        animating === seat.seat_number && "animate-seat-pop"
                      )}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-3">
          ▼ Rear
        </div>
      </div>
    </div>
  );
}
