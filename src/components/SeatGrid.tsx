import { Seat } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SeatGridProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSelect: (seatNumber: string) => void;
}

export function SeatGrid({ seats, selectedSeat, onSelect }: SeatGridProps) {
  const [animating, setAnimating] = useState<string | null>(null);

  const maxRow = Math.max(...seats.map((s) => s.row));
  const rows = Array.from({ length: maxRow + 1 }, (_, i) => i);

  const handleSelect = (seat: Seat) => {
    if (seat.status === "booked") return;
    setAnimating(seat.number);
    onSelect(seat.number === selectedSeat ? "" : seat.number);
    setTimeout(() => setAnimating(null), 250);
  };

  const getSeatForPosition = (row: number, col: number) => {
    return seats.find((s) => s.row === row && s.col === col);
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-shuttle-seat-available border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-shuttle-seat-booked" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      {/* Bus layout */}
      <div className="mx-auto max-w-[240px] rounded-2xl border bg-card p-4 shadow-sm">
        {/* Driver area */}
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">🚌</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">DRIVER</span>
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>

        {/* Seat rows */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-between">
              {/* Left pair */}
              <div className="flex gap-1.5">
                {[0, 1].map((col) => {
                  const seat = getSeatForPosition(row, col);
                  if (!seat) return <div key={col} className="h-9 w-9" />;
                  const isSelected = seat.number === selectedSeat;
                  const isBooked = seat.status === "booked";
                  return (
                    <button
                      key={col}
                      onClick={() => handleSelect(seat)}
                      disabled={isBooked}
                      className={cn(
                        "h-9 w-9 rounded-lg text-xs font-medium transition-all duration-150",
                        "flex items-center justify-center",
                        isBooked && "bg-shuttle-seat-booked cursor-not-allowed text-muted-foreground",
                        isSelected && "bg-primary text-primary-foreground shadow-md",
                        !isBooked && !isSelected && "bg-shuttle-seat-available border border-border hover:border-primary hover:bg-primary/10",
                        animating === seat.number && "animate-seat-pop"
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              {/* Aisle */}
              <div className="w-6" />

              {/* Right pair */}
              <div className="flex gap-1.5">
                {[2, 3].map((col) => {
                  const seat = getSeatForPosition(row, col);
                  if (!seat) return <div key={col} className="h-9 w-9" />;
                  const isSelected = seat.number === selectedSeat;
                  const isBooked = seat.status === "booked";
                  return (
                    <button
                      key={col}
                      onClick={() => handleSelect(seat)}
                      disabled={isBooked}
                      className={cn(
                        "h-9 w-9 rounded-lg text-xs font-medium transition-all duration-150",
                        "flex items-center justify-center",
                        isBooked && "bg-shuttle-seat-booked cursor-not-allowed text-muted-foreground",
                        isSelected && "bg-primary text-primary-foreground shadow-md",
                        !isBooked && !isSelected && "bg-shuttle-seat-available border border-border hover:border-primary hover:bg-primary/10",
                        animating === seat.number && "animate-seat-pop"
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
