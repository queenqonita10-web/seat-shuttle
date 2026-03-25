import { PickupPoint, formatPrice } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { MapPin, Flag } from "lucide-react";

interface RouteTimelineProps {
  pickupPoints: PickupPoint[];
  selectedPointId: string;
  departureTime: string;
  destination: string;
}

export function RouteTimeline({ pickupPoints, selectedPointId, departureTime, destination }: RouteTimelineProps) {
  const getTime = (offset: number) => {
    const [h, m] = departureTime.split(":").map(Number);
    const total = h * 60 + m + offset;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-0">
      {pickupPoints.map((point, idx) => {
        const isSelected = point.id === selectedPointId;
        const isPast = point.order < (pickupPoints.find((p) => p.id === selectedPointId)?.order ?? 0);
        const isLast = idx === pickupPoints.length - 1;

        return (
          <div key={point.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center z-10",
                  isSelected
                    ? "border-primary bg-primary"
                    : isPast
                    ? "border-muted-foreground/40 bg-muted-foreground/20"
                    : "border-border bg-card"
                )}
              >
                {isSelected && <MapPin size={8} className="text-primary-foreground" />}
              </div>
              {!isLast && (
                <div className={cn("w-0.5 flex-1 min-h-[28px]", isPast || isSelected ? "bg-primary/30" : "bg-border")} />
              )}
            </div>

            <div className={cn("pb-4 -mt-0.5 flex-1", isSelected && "font-semibold")}>
              <div className="flex items-center justify-between">
                <div className={cn("text-sm", isSelected ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground")}>
                  {point.label}
                </div>
                {point.fare > 0 && (
                  <span className="text-[10px] text-muted-foreground">{formatPrice(point.fare)}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{getTime(point.timeOffset)}</div>
            </div>
          </div>
        );
      })}

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="h-4 w-4 rounded-full border-2 border-secondary bg-secondary flex items-center justify-center">
            <Flag size={8} className="text-secondary-foreground" />
          </div>
        </div>
        <div className="-mt-0.5">
          <div className="text-sm font-semibold text-secondary">{destination}</div>
          <div className="text-xs text-muted-foreground">
            {getTime(pickupPoints[pickupPoints.length - 1]?.timeOffset + 15)}
          </div>
        </div>
      </div>
    </div>
  );
}
