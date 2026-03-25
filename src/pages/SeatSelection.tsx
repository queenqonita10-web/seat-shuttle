import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { SeatGrid } from "@/components/SeatGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/data/mockData";

export default function SeatSelection() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, setSelectedSeat } = useBooking();

  if (!selectedTrip) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/search")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-lg font-bold">Choose Your Seat</h1>
          <p className="text-sm text-primary-foreground/70">Departure: {selectedTrip.departureTime}</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4">
        <SeatGrid
          seats={selectedTrip.seats}
          selectedSeat={selectedSeat}
          onSelect={(s) => setSelectedSeat(s || null)}
        />
      </div>

      {/* Bottom bar */}
      {selectedSeat && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card shadow-lg animate-fade-up">
          <div className="mx-auto max-w-md flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Seat <span className="font-bold text-foreground">#{selectedSeat}</span></p>
              <p className="text-lg font-bold text-primary">{formatPrice(selectedTrip.price)}</p>
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
