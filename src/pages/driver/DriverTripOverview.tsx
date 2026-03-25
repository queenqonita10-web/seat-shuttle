import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { useRoutes } from "@/hooks/useRoutes";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, CheckCircle2, Circle, MapPin, Navigation, 
  ChevronRight, ChevronLeft, Map as MapIcon, LayoutList,
  Clock, Users, Flag, Bus, AlertTriangle, CloudRain, Sun, 
  Wind, Activity, Zap, Info, ShieldAlert, Wifi, Globe,
  MessageSquare, Phone, MoreHorizontal, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const DriverTripOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    activeTrip, currentStopIndex, bookings, isDrivingMode, playFeedback, 
    nextStop, prevStop, trafficLevel, weather, stressLevel, fatigueLevel,
    activeEvents, resolveEvent, etaAdjustment, addEvent, difficulty,
    scheduleDeviation, setScheduleDeviation, locationVerified, setLocationVerified
  } = useDriver();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"gps" | "wifi" | "manual">("gps");

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  // Schedule Deviation Monitoring
  useEffect(() => {
    if (!activeTrip) return;
    
    const monitorInterval = setInterval(() => {
      // Simulate deviation drift
      const drift = (Math.random() - 0.5) * 2;
      setScheduleDeviation(scheduleDeviation + drift);

      // Notify for significant deviations
      if (scheduleDeviation > 5) {
        toast({
          title: "Late Arrival Warning",
          description: `You are ${Math.round(scheduleDeviation)}m behind schedule. Automatic passenger alerts sent.`,
          variant: "destructive"
        });
      } else if (scheduleDeviation < -10) {
        toast({
          title: "Early Arrival Warning",
          description: `You are ${Math.abs(Math.round(scheduleDeviation))}m ahead of schedule. Passengers notified to prepare early.`,
          variant: "default"
        });
      }
    }, 10000);

    return () => clearInterval(monitorInterval);
  }, [activeTrip, scheduleDeviation]);

  // Traffic & Escalation Logic
  useEffect(() => {
    if (etaAdjustment > 20) {
      toast({
        title: "Critical Traffic Delay",
        description: "Delay > 20m. Proactive customer service escalation initiated.",
        variant: "destructive"
      });
      playFeedback("error");
    }
  }, [etaAdjustment]);

  const route = routes.find((r) => r.id === activeTrip.routeId);
  const stops = route?.pickupPoints ?? [];
  const isLastStop = currentStopIndex >= stops.length;

  const handleArrive = () => {
    if (!locationVerified) {
      setShowLocationDialog(true);
      return;
    }
    if (isLastStop) {
      navigate("/driver/summary");
      return;
    }
    playFeedback("success");
    navigate("/driver/pickup");
  };

  const progressPercent = ((currentStopIndex) / stops.length) * 100;
  const currentStop = stops[currentStopIndex];
  const totalPax = bookings.length;

  const handleVoiceCommand = (command: string) => {
    if (command === "arrive") {
      handleArrive();
    } else if (command === "next stop") {
      if (currentStopIndex < stops.length) nextStop();
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-orange-500";
      case "rush_hour": return "text-red-500 animate-pulse";
      default: return "text-white";
    }
  };

  const getWeatherIcon = (w: string) => {
    switch (w) {
      case "clear": return <Sun size={18} className="text-yellow-400" />;
      case "rain": return <CloudRain size={18} className="text-blue-400" />;
      case "fog": return <Wind size={18} className="text-zinc-400" />;
      case "storm": return <Zap size={18} className="text-purple-400" />;
      default: return <Sun size={18} />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-28 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header with Simulation Status */}
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
            
            {/* Simulation Status Pills */}
            <div className="flex gap-2">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                {getWeatherIcon(weather)}
                <span className="text-[10px] font-black uppercase">{weather}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                <Activity size={14} className={getTrafficColor(trafficLevel)} />
                <span className="text-[10px] font-black uppercase">{trafficLevel.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex bg-black/20 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                  viewMode === "list" ? "bg-white text-black shadow-lg" : "text-white/50"
                )}
              >
                <LayoutList size={18} strokeWidth={3} />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                  viewMode === "map" ? "bg-white text-black shadow-lg" : "text-white/50"
                )}
              >
                <MapIcon size={18} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Schedule & Location Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 p-4 rounded-2xl flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase opacity-50 mb-1">Schedule Status</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-lg font-black",
                  scheduleDeviation > 5 ? "text-red-500" : scheduleDeviation < -5 ? "text-green-500" : "text-white"
                )}>
                  {scheduleDeviation > 0 ? `+${Math.round(scheduleDeviation)}m` : scheduleDeviation < 0 ? `${Math.round(scheduleDeviation)}m` : "ON TIME"}
                </span>
                <Clock size={16} className="opacity-30" />
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase opacity-50 mb-1">Location Lock</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-lg font-black",
                  locationVerified ? "text-green-500" : "text-yellow-500 animate-pulse"
                )}>
                  {locationVerified ? "VERIFIED" : "LOCKING..."}
                </span>
                <MapPin size={16} className="opacity-30" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">{route?.name}</h1>
              <div className="flex items-center gap-2 opacity-60">
                <Users size={14} strokeWidth={3} />
                <p className="text-xs font-black uppercase tracking-widest">{totalPax} PAX TOTAL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black leading-none tracking-tighter">{currentStopIndex}/{stops.length}</p>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">STOPS</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
              <span>Trip Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Floating Active Events / Alerts */}
      {activeEvents.length > 0 && (
        <div className="sticky top-[260px] mx-6 z-50 space-y-3 pointer-events-none">
          {activeEvents.map((event) => (
            <div 
              key={event.id}
              className="bg-red-600/90 backdrop-blur-xl p-4 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 pointer-events-auto"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{event.type.replace('_', ' ')}</p>
                  <p className="text-sm font-bold text-white leading-tight">{event.message}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/10"
                onClick={() => resolveEvent(event.id)}
              >
                Resolve
              </Button>
            </div>
          ))}
        </div>
      )}

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
                      <span className="text-xs font-black opacity-40 uppercase tracking-widest">
                        +{stop.timeOffset + (isCurrent ? Math.round(scheduleDeviation) : 0)}m
                      </span>
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
              "relative h-[360px] rounded-2xl overflow-hidden border-4 shadow-2xl",
              isDrivingMode ? "bg-zinc-900 border-white/10" : "bg-muted border-primary/10"
            )}>
              {/* Weather Effects Layer */}
              {weather !== 'clear' && (
                <div className={cn(
                  "absolute inset-0 z-10 pointer-events-none opacity-40",
                  weather === 'rain' ? "animate-rain" : weather === 'fog' ? "bg-white/20" : "animate-storm"
                )} />
              )}

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
                  stroke={trafficLevel === 'rush_hour' ? "#ef4444" : trafficLevel === 'high' ? "#f97316" : isDrivingMode ? "#3b82f6" : "#2563eb"} 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round"
                  className={cn(trafficLevel === 'rush_hour' && "animate-pulse")}
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
                  <MapPin size="32" x="-16" y="-35" className="text-destructive" fill="currentColor" />
                </g>
              </svg>

              {/* Floating Map Overlay */}
              <div className="absolute top-6 left-6 right-6">
                <div className="bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Dynamic Navigation</p>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full",
                      trafficLevel === 'rush_hour' ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
                    )}>
                      <Clock size={12} />
                      <span className="text-xs font-black uppercase">+{etaAdjustment} min delay</span>
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
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                        {trafficLevel === 'rush_hour' ? "REROUTING FOR TRAFFIC" : "Optimized Route Active"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Assistance Panel */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                {scheduleDeviation > 5 && (
                  <div className="bg-red-600/90 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <ShieldAlert size={16} className="text-white" />
                      <p className="text-xs font-black uppercase text-white">Behind Schedule: +{Math.round(scheduleDeviation)}m</p>
                    </div>
                  </div>
                )}
                <div className="bg-primary/90 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain size={16} className="text-white" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">AI Route Optimization</p>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">
                    {trafficLevel === 'rush_hour' ? "Detected heavy traffic. Suggested detour saves 4 minutes." : "Route clear. Maintaining current ETA."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Giant Action Button */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 z-50 transition-all duration-500",
        isDrivingMode ? "bg-black/90 backdrop-blur-xl border-t border-white/10" : "bg-white/90 backdrop-blur-md border-t"
      )}>
        <div className="mx-auto max-w-md flex gap-4">
          <Button
            className={cn(
              "flex-grow h-16 text-xl font-black gap-3 rounded-2xl shadow-2xl transition-all active:scale-95",
              isLastStop ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-primary shadow-primary/20",
              (!locationVerified) && "border-4 border-yellow-500"
            )}
            onClick={handleArrive}
          >
            {isLastStop ? (
              <>
                FINISH TRIP
                <Flag size={24} fill="currentColor" />
              </>
            ) : (
              <>
                ARRIVED
                <Navigation size={24} fill="currentColor" className="rotate-90" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Multi-Modal Location Verification Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-2xl border-0",
          isDrivingMode ? "bg-zinc-900 text-white" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Globe className="text-primary" size={24} />
              Location Check
            </DialogTitle>
            <DialogDescription className="font-bold uppercase tracking-widest text-xs opacity-50">
              Multi-modal verification required
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 grid grid-cols-3 gap-3">
            <button 
              onClick={() => setLocationMethod("gps")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                locationMethod === "gps" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <Navigation size={24} className={locationMethod === "gps" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">GPS Lock</span>
            </button>
            <button 
              onClick={() => setLocationMethod("wifi")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                locationMethod === "wifi" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <Wifi size={24} className={locationMethod === "wifi" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">WiFi Tri</span>
            </button>
            <button 
              onClick={() => setLocationMethod("manual")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                locationMethod === "manual" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <MapPin size={24} className={locationMethod === "manual" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">Landmark</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">System Insight</p>
            <p className="text-sm font-bold opacity-70 leading-tight">
              {locationMethod === "gps" ? "Connecting to satellite array... Signal strength: Weak" : 
               locationMethod === "wifi" ? "Scanning local networks... MAC address matching active" : 
               "Identify nearby landmarks (e.g., Gas Station, Bank) to confirm position"}
            </p>
          </div>

          <DialogFooter>
            <Button
              className="w-full h-14 text-lg font-black rounded-2xl transition-all bg-primary text-white"
              onClick={() => {
                setLocationVerified(true);
                setShowLocationDialog(false);
                toast({ title: "Location Confirmed", description: "Multi-modal verification successful." });
              }}
            >
              CONFIRM & ARRIVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />
    </div>
  );
};

export default DriverTripOverview;
