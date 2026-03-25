import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useRoutes } from "@/hooks/useRoutes";
import { useVehicleTypes } from "@/hooks/useVehicles";
import { SeatGrid } from "@/components/SeatGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import { formatPrice, getPickupTime, getSeatPosition } from "@/lib/formatters";

export default function SeatSelection() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, setSelectedSeat, pickupPoint } = useBooking();
  const { data: routes = [] } = useRoutes();
  const { data: vehicleTypes = [] } = useVehicleTypes();

  if (!selectedTrip) {
    navigate("/");
    return null;
  }

  const route = routes.find((r) => r.id === selectedTrip.route_id);
  const routePickup = route?.pickup_points.find((p) => p.id === pickupPoint?.id);
  const fare = routePickup?.fare ?? 0;
  const pickupTime = routePickup
    ? getPickupTime(selectedTrip.departure_time, routePickup)
    : selectedTrip.departure_time;

  const vt = vehicleTypes.find((v) => v.id === selectedTrip.vehicle_type_id);
  const layout = (vt?.layout as string[][]) ?? [];

  const selectedSeatObj = selectedSeat
    ? selectedTrip.seats.find((s) => s.seat_number === selectedSeat)
    : null;
  const seatPos = selectedSeatObj
    ? getSeatPosition(selectedSeatObj.row_num, selectedSeatObj.col_num, layout)
    : "";

  // Convert seats to the format SeatGrid expects
  const gridSeats = selectedTrip.seats.map((s) => ({
    id: s.id,
    number: s.seat_number,
    row: s.row_num,
    col: s.col_num,
    status: s.status as "available" | "booked",
  }));

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/search")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-lg font-bold">Choose Your Seat</h1>
          <p className="text-sm text-primary-foreground/70">Departure: {selectedTrip.departure_time}</p>
        </div>
      </div>

      {pickupPoint && (
        <div className="bg-secondary/10 border-b border-secondary/20">
          <div className="mx-auto max-w-md px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-secondary" />
              <span className="text-xs font-medium text-foreground">{pickupPoint.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-secondary" />
              <span className="text-xs font-semibold text-secondary">{pickupTime}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md px-5 mt-4">
        <SeatGrid
          seats={gridSeats}
          selectedSeat={selectedSeat}
          onSelect={(s) => setSelectedSeat(s || null)}
          vehicleTypeId={selectedTrip.vehicle_type_id}
        />
      </div>

      {selectedSeat && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card shadow-lg animate-fade-up">
          <div className="mx-auto max-w-md flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Seat <span className="font-bold text-foreground">#{selectedSeat}</span>
                {seatPos && <span className="text-xs text-muted-foreground"> · {seatPos}</span>}
              </p>
              <p className="text-lg font-bold text-primary">{formatPrice(fare)}</p>
            </div>
            <Button onClick={() => navigate("/route")} className="px-6 h-11 font-semibold">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
