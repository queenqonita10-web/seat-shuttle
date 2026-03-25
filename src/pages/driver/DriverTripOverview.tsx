import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { routes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, CheckCircle2, Circle, MapPin, Navigation, 
  ChevronRight, ChevronLeft, Map as MapIcon, LayoutList,
  Clock, Users, Flag, Bus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const DriverTripOverview = () => {
  const navigate = useNavigate();
  const { activeTrip, currentStopIndex, bookings, isDrivingMode, playFeedback, nextStop, prevStop } = useDriver();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const route = routes.find((r) => r.id === activeTrip.routeId);
  const stops = route?.pickupPoints ?? [];
  const isLastStop = currentStopIndex >= stops.length;

  const handleArrive = () => {
    if (isLastStop) {
      navigate("/driver/summary");
      return;
    }
    playFeedback("success");
    navigate("/driver/pickup");
  };

  const progressPercent = ((currentStopIndex) / stops.length) * 100;
  const currentStop = stops[currentStopIndex];
  const nextStopObj = stops[currentStopIndex + 1];
  const totalPax = bookings.length;

  const handleVoiceCommand = (command: string) => {
    if (command === "arrive") {
      handleArrive();
    } else if (command === "next stop") {
      if (currentStopIndex < stops.length) nextStop();
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-40 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header with Progress Panel */}
      <div className={cn(
        "px-6 pb-6 pt-16 sticky top-0 z-40 shadow-2xl transition-all duration-500",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/driver")}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-70"
            >
              <ArrowLeft size={20} strokeWidth={3} />
              Exit
            </button>
            <div className="flex bg-black/20 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                  viewMode === "list" ? "bg-white text-black shadow-lg" : "text-white/50"
                )}
              >
                <LayoutList size={18} strokeWidth={3} />
                <span className="text-xs font-black uppercase">List</span>
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                  viewMode === "map" ? "bg-white text-black shadow-lg" : "text-white/50"
                )}
              >
                <MapIcon size={18} strokeWidth={3} />
                <span className="text-xs font-black uppercase">Map</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{route?.name}</h1>
              <div className="flex items-center gap-2 opacity-60">
                <Users size={14} strokeWidth={3} />
                <p className="text-xs font-black uppercase tracking-widest">{totalPax} PAX TOTAL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black leading-none tracking-tighter">{currentStopIndex}/{stops.length}</p>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">STOPS</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 mt-8">
        {viewMode === "list" ? (
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
        ) : (
          /* Simulated Map Navigation Mode */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className={cn(
              "relative h-96 rounded-[3rem] overflow-hidden border-4 shadow-2xl",
              isDrivingMode ? "bg-zinc-900 border-white/10" : "bg-muted border-primary/10"
            )}>
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                  <path d="M0,100 L400,100 M0,200 L400,200 M0,300 L400,300 M100,0 L100,400 M200,0 L200,400 M300,0 L300,400" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M50,50 L350,350 M350,50 L50,350" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                </svg>
              </div>

              {/* Navigation Route Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                <path 
                  d="M 200,350 C 200,300 300,250 300,200 S 100,150 100,50" 
                  stroke={isDrivingMode ? "#3b82f6" : "#2563eb"} 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                
                {/* Current Position (Bus) */}
                <g className="animate-bounce">
                  <circle cx="200" cy="350" r="15" fill={isDrivingMode ? "white" : "black"} />
                  <Bus size={20} x="190" y="340" className="text-primary" />
                </g>

                {/* Target Stop Marker */}
                <g transform="translate(100, 50)">
                  <circle r="20" fill="#ef4444" className="animate-ping" opacity="0.3" />
                  <circle r="10" fill="#ef4444" />
                  <MapPin size={32} x="-16" y="-35" className="text-destructive" fill="currentColor" />
                </g>
              </svg>

              {/* Floating Map Overlay */}
              <div className="absolute top-6 left-6 right-6">
                <div className="bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Current Leg</p>
                    <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
                      <Clock size={12} className="text-primary" />
                      <span className="text-xs font-black text-primary uppercase">12 min delay</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                      <Navigation size={24} fill="white" className="rotate-45" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-1">
                        {currentStop?.label || "DESTINATION"}
                      </h4>
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Head North on Jl. Sudirman</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance Indicator */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Next Stop In</p>
                  <p className="text-2xl font-black text-white tracking-tighter">1.2 KM</p>
                </div>
                <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">ETA</p>
                  <p className="text-2xl font-black text-white tracking-tighter">08:45 AM</p>
                </div>
              </div>
            </div>

            {/* Next Stop Preview Card */}
            <div className={cn(
              "p-8 rounded-[2.5rem] border-4 flex items-center justify-between transition-all",
              isDrivingMode ? "bg-zinc-900 border-white/10" : "bg-white border-muted"
            )}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Following Stop</p>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {nextStopObj?.label || "Last Destination"}
                </h3>
              </div>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ChevronRight size={32} className="opacity-30" strokeWidth={3} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Giant Action Button */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-6 z-50 transition-all duration-500",
        isDrivingMode ? "bg-black/90 backdrop-blur-xl border-t border-white/10" : "bg-white/90 backdrop-blur-md border-t"
      )}>
        <div className="mx-auto max-w-md flex gap-4">
          <Button
            className={cn(
              "flex-grow h-24 text-3xl font-black gap-4 rounded-[2rem] shadow-2xl transition-all active:scale-95",
              isLastStop ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-primary shadow-primary/20"
            )}
            onClick={handleArrive}
          >
            {isLastStop ? (
              <>
                FINISH TRIP
                <Flag size={32} fill="currentColor" />
              </>
            ) : (
              <>
                ARRIVED
                <Navigation size={32} fill="currentColor" className="rotate-90" />
              </>
            )}
          </Button>
        </div>
      </div>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />
    </div>
  );
};

export default DriverTripOverview;
