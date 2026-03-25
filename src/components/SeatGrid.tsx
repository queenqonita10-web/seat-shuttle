import { Seat, getVehicleType } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SeatGridProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSelect: (seatNumber: string) => void;
  vehicleTypeId: string;
}

export function SeatGrid({ seats, selectedSeat, onSelect, vehicleTypeId }: SeatGridProps) {
  const [animating, setAnimating] = useState<string | null>(null);
  const vt = getVehicleType(vehicleTypeId);
  const available = seats.filter((s) => s.status === "available").length;

  const handleSelect = (seat: Seat) => {
    if (seat.status === "booked") return;
    setAnimating(seat.number);
    onSelect(seat.number === selectedSeat ? "" : seat.number);
    setTimeout(() => setAnimating(null), 250);
  };

  const getSeatForPosition = (row: number, col: number) =>
    seats.find((s) => s.row === row && s.col === col);

  return (
    <div className="space-y-4">
      {/* Vehicle name & availability */}
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{vt.name}</p>
        <p className="text-xs text-muted-foreground">{available} of {seats.length} seats available</p>
      </div>

      {/* Legend */}
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

      {/* Bus layout */}
      <div className="mx-auto max-w-[280px] rounded-2xl border bg-card p-4 shadow-sm">
        {/* FRONT label */}
        <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          ▲ Front
        </div>

        <div className="space-y-2">
          {vt.layout.map((row, rowIdx) => {
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

                  const isSelected = seat.number === selectedSeat;
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
                        animating === seat.number && "animate-seat-pop"
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* REAR label */}
        <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-3">
          ▼ Rear
        </div>
      </div>
    </div>
  );
}
