import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Home, MapPin, Navigation, UserCheck, UserMinus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DriverTripSummary = () => {
  const navigate = useNavigate();
  const { activeTrip, bookings, reset, isDrivingMode, playFeedback } = useDriver();

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const pickedUp = bookings.filter(b => b.status === "picked_up").length;
  const noShows = bookings.filter(b => b.status === "no_show").length;
  const pending = bookings.filter(b => b.status === "pending").length;

  const handleFinish = () => {
    reset();
    playFeedback("action");
    navigate("/driver");
  };

  return (
    <div className={cn(
      "min-h-screen pb-10 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header */}
      <div className={cn(
        "px-6 pb-24 pt-20 text-center transition-colors duration-500 shadow-2xl",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <CheckCircle2 size={100} strokeWidth={3} className="mx-auto mb-8 text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-bounce" />
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">MISSION COMPLETE</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-50">Route: Makassar Barat</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-16 space-y-8">
        {/* Giant Stats Card */}
        <Card className={cn(
          "shadow-2xl border-0 overflow-hidden rounded-[2.5rem]",
          isDrivingMode ? "bg-zinc-900 ring-1 ring-white/20" : "bg-white"
        )}>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-white/5">
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Picked Up</p>
                <p className="text-5xl font-black text-green-500 tracking-tighter">{pickedUp}</p>
              </div>
              <div className="p-8 text-center bg-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">No Show</p>
                <p className="text-5xl font-black text-red-500 tracking-tighter">{noShows}</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Pending</p>
                <p className="text-5xl font-black text-orange-500 tracking-tighter">{pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button - Giant for Easy Access */}
        <Button 
          className="w-full h-24 rounded-[2rem] text-3xl font-black gap-4 shadow-2xl shadow-primary/20 mt-10"
          onClick={handleFinish}
        >
          <Home size={32} strokeWidth={3} />
          DONE
        </Button>
      </div>
    </div>
  );
};

export default DriverTripSummary;
