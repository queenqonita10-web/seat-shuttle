import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { routes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, MapPin, Navigation, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";

const DriverTripOverview = () => {
  const navigate = useNavigate();
  const { activeTrip, currentStopIndex, bookings, isDrivingMode, playFeedback, nextStop, prevStop } = useDriver();

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const route = routes.find((r) => r.id === activeTrip.routeId);
  const stops = route?.pickupPoints ?? [];

  const handleArrive = () => {
    playFeedback("success");
    navigate("/driver/pickup");
  };

  const handleVoiceCommand = (command: string) => {
    if (command === "arrive") {
      handleArrive();
    } else if (command === "next stop") {
      if (currentStopIndex < stops.length) nextStop();
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-32 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header */}
      <div className={cn(
        "px-6 pb-8 pt-16 sticky top-0 z-20 shadow-2xl transition-colors duration-500",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <button
            onClick={() => navigate("/driver")}
            className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-70"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            Exit Trip
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{route?.name}</h1>
              <p className="text-sm font-bold opacity-60 tracking-widest uppercase">TRIP #{activeTrip.id}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black leading-none tracking-tighter">4</p>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">PAX TOTAL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 mt-10">
        {/* Glanceable Next Stop Info */}
        <div className={cn(
          "mb-10 p-8 rounded-[2.5rem] transition-all border-4",
          isDrivingMode ? "bg-zinc-900 border-white/20" : "bg-muted border-primary/10"
        )}>
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4">Target Destination</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {currentStopIndex < stops.length ? stops[currentStopIndex].label : route?.destination}
            </h2>
            <Navigation className="text-primary animate-pulse" size={40} fill="currentColor" />
          </div>
          {currentStopIndex < stops.length && (
            <p className="mt-4 text-xl font-bold opacity-60">
              {bookings.filter(b => b.pickupPointId === stops[currentStopIndex].id).length} PAX waiting
            </p>
          )}
        </div>

        {/* High Contrast Timeline */}
        <div className="space-y-12 relative before:content-[''] before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1.5 before:bg-muted-foreground/10">
          {stops.map((stop, index) => {
            const isCompleted = index < currentStopIndex;
            const isCurrent = index === currentStopIndex;
            const stopBookings = bookings.filter((b) => b.pickupPointId === stop.id);
            const passengerCount = stopBookings.length;

            return (
              <div 
                key={stop.id} 
                className={cn(
                  "relative flex gap-8 transition-all duration-300",
                  !isCurrent && !isCompleted && "opacity-30 grayscale"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 border-4",
                    isCompleted 
                      ? "bg-green-600 border-white text-white" 
                      : isCurrent 
                        ? "bg-primary border-white text-white scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)]" 
                        : "bg-zinc-800 border-white/10 text-white/30"
                  )}
                >
                  {isCompleted ? <CheckCircle2 size={32} strokeWidth={3} /> : <Navigation size={32} fill="white" />}
                </div>

                <div className="flex-grow pt-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                      "text-2xl font-black uppercase tracking-tight leading-none",
                      isCurrent ? "text-primary" : ""
                    )}>
                      {stop.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {passengerCount > 0 && (
                      <span className={cn(
                        "text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest",
                        isCurrent ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {passengerCount} PAX
                      </span>
                    )}
                    <span className="text-xs font-black opacity-40 uppercase tracking-widest">+{stop.timeOffset}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Giant Action Button */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-6 z-30 transition-all duration-500",
        isDrivingMode ? "bg-black/90 backdrop-blur-xl border-t border-white/10" : "bg-white/90 backdrop-blur-md border-t"
      )}>
        <div className="mx-auto max-w-md flex gap-4">
          <Button
            className="flex-grow h-24 text-3xl font-black gap-4 rounded-[2rem] shadow-2xl transition-all active:scale-95 shadow-primary/20"
            onClick={handleArrive}
          >
            {currentStopIndex === stops.length ? "FINISH TRIP" : "ARRIVED"}
            <Navigation size={32} fill="currentColor" className="rotate-90" />
          </Button>
        </div>
      </div>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />
    </div>
  );
};

export default DriverTripOverview;
