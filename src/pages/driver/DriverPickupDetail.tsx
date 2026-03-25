import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { routes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, QrCode, UserMinus, UserCheck, 
  XCircle, Navigation, Phone, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";
import { useState, useEffect } from "react";

const DriverPickupDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTrip, currentStopIndex, bookings, updateBookingStatus, nextStop, isDrivingMode, playFeedback } = useDriver();
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const route = routes.find((r) => r.id === activeTrip.routeId);
  const currentStop = route?.pickupPoints[currentStopIndex];
  const stopBookings = bookings.filter((b) => b.pickupPointId === currentStop?.id);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(id => {
          if (newTimers[id] > 0) {
            newTimers[id] -= 1;
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentStop) {
    navigate("/driver/summary");
    return null;
  }

  const startTimer = (id: string) => {
    setTimers(prev => ({ ...prev, [id]: 120 })); // 2 minutes
    setActiveTimerId(id);
    playFeedback("action");
    toast({ title: "Timer Started", description: "Waiting 2 minutes for passenger." });
  };

  const handleNextStop = () => {
    nextStop();
    navigate("/driver/trip");
  };

  const handlePickupAll = () => {
    stopBookings.forEach(b => {
      if (b.status === "pending") updateBookingStatus(b.id, "picked_up");
    });
    playFeedback("success");
    toast({ title: "All Picked Up!", description: "All passengers at this stop have been checked in." });
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
    playFeedback("action");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceCommand = (command: string) => {
    if (command === "pickup all") {
      handlePickupAll();
    } else if (command === "next stop") {
      if (allProcessed) handleNextStop();
    }
  };

  const allProcessed = stopBookings.every(b => b.status !== "pending");

  const handleWrongStop = () => {
    const nextValidStop = stops[currentStopIndex + 1];
    if (nextValidStop) {
      toast({ 
        title: "Wrong Stop?", 
        description: `Next valid stop is ${nextValidStop.label}. Tap Continue to skip this stop.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-40 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header */}
      <div className={cn(
        "px-6 pb-8 pt-16 sticky top-0 z-40 shadow-2xl transition-all duration-500",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <button
            onClick={() => navigate("/driver/trip")}
            className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-70"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            Map View
          </button>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-50 mb-1">Current Stop</p>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{currentStop.label}</h1>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black leading-none tracking-tighter">{stopBookings.filter(b => b.status === "pending").length}</p>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">REMAINING</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 mt-8 space-y-6">
        {stopBookings.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in zoom-in">
            <CheckCircle2 size={100} strokeWidth={1} className="mx-auto text-green-500 mb-6 opacity-20" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">Clear to Go</h3>
            <p className="text-xl opacity-50 font-bold mt-2">No pickups scheduled here</p>
          </div>
        ) : (
          stopBookings.map((booking) => {
            const timerValue = timers[booking.id];
            const isTimerRunning = timerValue > 0;

            return (
              <Card key={booking.id} className={cn(
                "border-0 transition-all shadow-2xl rounded-[2.5rem] overflow-hidden transform active:scale-[0.98]",
                booking.status === "picked_up" ? "bg-green-600/10 ring-4 ring-green-600" : 
                booking.status === "no_show" ? "bg-red-600/5 opacity-40 grayscale" : 
                isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-white"
              )}>
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-3xl font-black uppercase tracking-tight">{booking.passengerName}</h3>
                        {isTimerRunning && (
                          <Badge className="bg-destructive text-white animate-pulse px-3 py-1 font-black rounded-lg">
                            <Clock size={14} className="mr-1" /> {formatTime(timerValue)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold opacity-60 tracking-tight">{booking.passengerPhone}</p>
                        <button 
                          onClick={() => handleCall(booking.phone)}
                          className="bg-primary/20 text-primary p-2 rounded-xl active:scale-90 transition-all"
                        >
                          <Phone size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-2xl px-5 py-2 font-black rounded-2xl shadow-xl",
                      booking.status === "picked_up" ? "bg-green-600 text-white" : 
                      booking.status === "no_show" ? "bg-red-600 text-white" : 
                      isDrivingMode ? "bg-white text-black" : "bg-primary text-white"
                    )}>
                      #{booking.seatNumber}
                    </Badge>
                  </div>

                  {booking.status === "pending" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          className="h-24 rounded-[1.5rem] bg-green-600 hover:bg-green-700 text-2xl font-black gap-3 shadow-xl shadow-green-600/20"
                          onClick={() => updateBookingStatus(booking.id, "picked_up")}
                        >
                          <UserCheck size={32} strokeWidth={3} />
                          BOARD
                        </Button>
                        {!isTimerRunning ? (
                          <Button 
                            variant="outline"
                            className="h-24 rounded-[1.5rem] border-4 border-shuttle-warning text-shuttle-warning hover:bg-shuttle-warning/5 text-2xl font-black gap-3"
                            onClick={() => startTimer(booking.id)}
                          >
                            <Clock size={32} strokeWidth={3} />
                            WAIT
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            className="h-24 rounded-[1.5rem] border-4 border-red-600 text-red-600 hover:bg-red-50 text-2xl font-black gap-3"
                            onClick={() => updateBookingStatus(booking.id, "no_show")}
                          >
                            <UserMinus size={32} strokeWidth={3} />
                            MISS
                          </Button>
                        )}
                      </div>
                      
                      {isTimerRunning && timerValue < 60 && (
                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-black uppercase tracking-widest justify-center">
                          <AlertCircle size={18} />
                          No show candidate in {formatTime(timerValue)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-xl font-black uppercase tracking-widest">
                      {booking.status === "picked_up" ? (
                        <span className="text-green-600 flex items-center gap-2 animate-in slide-in-from-left duration-300">
                          <CheckCircle2 size={28} strokeWidth={3} /> BOARDED
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-2 animate-in slide-in-from-left duration-300">
                          <XCircle size={28} strokeWidth={3} /> NO SHOW
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        className="ml-auto text-muted-foreground font-black underline uppercase text-xs flex items-center gap-1"
                        onClick={() => updateBookingStatus(booking.id, "pending")}
                      >
                        <RefreshCw size={12} /> Undo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Predictive Suggestion: Pickup All */}
        {!allProcessed && stopBookings.length > 1 && (
          <Button 
            variant="outline" 
            className={cn(
              "w-full h-20 rounded-[2rem] border-4 text-xl font-black gap-4 mt-4 transition-all active:bg-primary active:text-white",
              isDrivingMode ? "border-white/20 text-white bg-white/5" : "border-primary text-primary"
            )}
            onClick={handlePickupAll}
          >
            <UserCheck size={24} strokeWidth={3} />
            BOARD ALL AT THIS STOP
          </Button>
        )}

        {/* Global QR Scan Button - Giant for Driving */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button 
            variant="outline" 
            className={cn(
              "h-24 rounded-[2rem] border-4 text-xl font-black gap-4 transition-all shadow-2xl active:scale-95",
              isDrivingMode ? "border-primary text-primary bg-primary/5" : "border-primary text-primary"
            )}
            onClick={() => navigate("/driver/scan")}
          >
            <QrCode size={32} strokeWidth={3} />
            SCAN QR
          </Button>
          <Button 
            variant="outline" 
            className={cn(
              "h-24 rounded-[2rem] border-4 text-xl font-black gap-4 transition-all shadow-2xl active:scale-95",
              isDrivingMode ? "border-white/20 text-white bg-white/5" : "border-zinc-300 text-zinc-500"
            )}
            onClick={handleWrongStop}
          >
            <AlertCircle size={32} strokeWidth={3} />
            WRONG STOP
          </Button>
        </div>
      </div>

      {/* Sticky Bottom Next Step Button - Progressive Disclosure */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-6 z-50 transition-all duration-500",
        isDrivingMode ? "bg-black/90 backdrop-blur-xl border-t border-white/10" : "bg-white/90 backdrop-blur-md border-t"
      )}>
        <div className="mx-auto max-w-md">
          <Button
            className={cn(
              "w-full h-24 text-3xl font-black rounded-[2rem] shadow-2xl transition-all duration-500",
              allProcessed ? "bg-primary text-white shadow-primary/40 active:translate-y-1" : "bg-zinc-800 text-white/20 cursor-not-allowed"
            )}
            onClick={handleNextStop}
            disabled={!allProcessed && stopBookings.length > 0}
          >
            {allProcessed ? "CONTINUE TRIP" : "PROCESS REMAINING"}
            <Navigation size={32} fill="currentColor" className="rotate-90 ml-2" />
          </Button>
          {!allProcessed && stopBookings.length > 0 && (
            <p className="text-center text-[10px] font-black mt-4 uppercase tracking-[0.4em] opacity-40">
              Clear all manifests to proceed
            </p>
          )}
        </div>
      </div>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />
    </div>
  );
};

export default DriverPickupDetail;
