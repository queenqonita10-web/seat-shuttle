import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { useRoutes } from "@/hooks/useRoutes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, QrCode, UserMinus, UserCheck, 
  XCircle, Navigation, Phone, Clock, AlertCircle, RefreshCw,
  Coffee, Luggage, MessageSquare, Brain, ShieldAlert,
  Camera, Hash, UserPlus, Info, Settings, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const DriverPickupDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    activeTrip, currentStopIndex, bookings, updateBookingStatus, 
    nextStop, isDrivingMode, playFeedback, stressLevel, updatePerformance,
    waitLimit, setWaitLimit, addIncidentReport, locationVerified, setLocationVerified
  } = useDriver();
  const { data: routesData = [] } = useRoutes();
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [passengerRequests, setPassengerRequests] = useState<Record<string, string[]>>({});
  const [showVerification, setShowVerification] = useState<string | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<"qr" | "code" | "photo">("qr");
  const [verifyCode, setVerifyCode] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showNoShowConfirm, setShowNoShowConfirm] = useState<string | null>(null);

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const route = routesData.find((r) => r.id === activeTrip.route_id);
  const route = routesData.find((r) => r.id === activeTrip.route_id);
  const currentStop = route?.pickup_points[currentStopIndex];
  const stopBookings = bookings.filter((b) => b.pickup_point_id === currentStop?.id);

  // Simulate Random Passenger Requests
  useEffect(() => {
    if (stopBookings.length > 0) {
      const newRequests: Record<string, string[]> = {};
      stopBookings.forEach(b => {
        if (Math.random() < 0.3) {
          const possible = ["Extra Luggage", "Requesting Water", "Toilet Break"];
          newRequests[b.id] = [possible[Math.floor(Math.random() * possible.length)]];
        }
      });
      setPassengerRequests(newRequests);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(id => {
          if (newTimers[id] > 0) {
            newTimers[id] -= 1;
            // Auto-notify at 50% time
            if (newTimers[id] === Math.floor(waitLimit * 30)) {
              toast({ 
                title: "Auto-Notification Sent", 
                description: "SMS sent to passenger: 'Driver is waiting at pickup point.'",
                variant: "default" 
              });
            }
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waitLimit]);

  if (!currentStop) {
    navigate("/driver/summary");
    return null;
  }

  const startTimer = (id: string) => {
    setTimers(prev => ({ ...prev, [id]: waitLimit * 60 }));
    playFeedback("action");
    toast({ title: "Protocol Started", description: `Waiting ${waitLimit} minutes. Passenger notified.` });
  };

  const handleNoShow = (bookingId: string) => {
    updateBookingStatus(bookingId, "no_show");
    addIncidentReport({
      id: Math.random().toString(36).substr(2, 9),
      bookingId,
      type: "no_show",
      timestamp: new Date().toISOString(),
      details: "Passenger failed to arrive within wait limit. Automatic cancellation fee applied.",
      resolved: true
    });
    setShowNoShowConfirm(null);
    toast({ 
      title: "Incident Logged", 
      description: "No-show documented. Cancellation fee structure applied.",
      variant: "destructive" 
    });
  };

  const handleVerify = (bookingId: string) => {
    // In a real app, this would validate against the server
    updateBookingStatus(bookingId, "picked_up");
    playFeedback("success");
    setShowVerification(null);
    setVerifyCode("");
    toast({ title: "Identity Verified", description: "Passenger boarded successfully." });
  };

  const handleNextStop = () => {
    if (!locationVerified) {
      toast({ 
        title: "Location Not Verified", 
        description: "Please confirm your location or use manual override.",
        variant: "destructive" 
      });
      return;
    }
    nextStop();
    navigate("/driver/trip");
  };

  const handlePickupAll = () => {
    const startTime = Date.now();
    stopBookings.forEach(b => {
      if (b.status === "pending") updateBookingStatus(b.id, "picked_up");
    });
    const duration = Date.now() - startTime;
    updatePerformance({ reactionTime: duration });
    
    playFeedback("success");
    toast({ title: "Batch Boarding Complete", description: "All passengers verified and checked in." });
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

  const predictiveAction = useMemo(() => {
    if (allProcessed) return "Proceed to next stop";
    const pendingCount = stopBookings.filter(b => b.status === "pending").length;
    if (pendingCount > 1) return "One-touch board all passengers";
    return "Verify identity for remaining passenger";
  }, [allProcessed, stopBookings]);

  return (
    <div className={cn(
      "min-h-screen pb-40 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header with Simulation Status */}
      <div className={cn(
        "px-6 pb-8 pt-16 sticky top-0 z-40 shadow-2xl transition-all duration-500",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/driver/trip")}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-70"
            >
              <ArrowLeft size={20} strokeWidth={3} />
              Map View
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="bg-white/10 p-2 rounded-full active:scale-90 transition-all"
              >
                <Settings size={20} className="opacity-60" />
              </button>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  stressLevel > 70 ? "bg-red-500 animate-pulse" : "bg-green-500"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">System Stability</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-50 mb-1">Stop Manifest</p>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{currentStop.label}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={locationVerified ? "default" : "destructive"} className="text-[10px] font-black uppercase">
                  {locationVerified ? "Location Verified" : "Awaiting GPS Lock"}
                </Badge>
                {!locationVerified && (
                  <button 
                    onClick={() => setLocationVerified(true)}
                    className="text-[10px] font-black uppercase text-primary underline"
                  >
                    Manual Override
                  </button>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black leading-none tracking-tighter">{stopBookings.filter(b => b.status === "pending").length}</p>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">REMAINING</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 mt-8 space-y-6">
        {/* Predictive AI Suggestion Banner */}
        <div className="bg-primary/20 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-primary/30 flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Predictive Assistance</p>
            <p className="text-lg font-black uppercase tracking-tight leading-none mt-1">{predictiveAction}</p>
          </div>
        </div>

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
            const requests = passengerRequests[booking.id] || [];

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
                        <h3 className="text-3xl font-black uppercase tracking-tight">{booking.passenger_name}</h3>
                        {isTimerRunning && (
                          <Badge className="bg-destructive text-white animate-pulse px-3 py-1 font-black rounded-lg">
                            <Clock size={14} className="mr-1" /> {formatTime(timerValue)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold opacity-60 tracking-tight">{booking.passenger_phone}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleCall(booking.passenger_phone)}
                            className="bg-primary/20 text-primary p-2 rounded-xl active:scale-90 transition-all"
                          >
                            <Phone size={20} strokeWidth={3} />
                          </button>
                          <button 
                            className="bg-white/10 text-white/60 p-2 rounded-xl active:scale-90 transition-all"
                            onClick={() => {
                              addIncidentReport({
                                id: Math.random().toString(36).substr(2, 9),
                                bookingId: booking.id,
                                type: "conflict",
                                timestamp: new Date().toISOString(),
                                details: "Conflict reported: Multiple passengers claiming this seat/location.",
                                resolved: false
                              });
                              toast({ 
                                title: "Conflict Reported", 
                                description: "Incident logged. Verification protocol enforced.",
                                variant: "destructive" 
                              });
                            }}
                          >
                            <ShieldAlert size={20} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-2xl px-5 py-2 font-black rounded-2xl shadow-xl",
                      booking.status === "picked_up" ? "bg-green-600 text-white" : 
                      booking.status === "no_show" ? "bg-red-600 text-white" : 
                      isDrivingMode ? "bg-white text-black" : "bg-primary text-white"
                    )}>
                      #{booking.seat_number}
                    </Badge>
                  </div>

                  {/* Simulated Passenger Requests */}
                  {booking.status === "pending" && requests.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {requests.map(r => (
                        <div key={r} className="bg-orange-500/20 text-orange-500 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 border border-orange-500/20">
                          {r === "Extra Luggage" ? <Luggage size={14} /> : r === "Requesting Water" ? <Coffee size={14} /> : <MessageSquare size={14} />}
                          {r}
                        </div>
                      ))}
                    </div>
                  )}

                  {booking.status === "pending" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          className="h-24 rounded-[1.5rem] bg-green-600 hover:bg-green-700 text-2xl font-black gap-3 shadow-xl shadow-green-600/20"
                          onClick={() => setShowVerification(booking.id)}
                        >
                          <UserCheck size={32} strokeWidth={3} />
                          VERIFY
                        </Button>
                        {!isTimerRunning ? (
                          <Button 
                            variant="outline"
                            className="h-24 rounded-[1.5rem] border-4 border-pyugo-warning text-pyugo-warning hover:bg-pyugo-warning/5 text-2xl font-black gap-3"
                            onClick={() => startTimer(booking.id)}
                          >
                            <Clock size={32} strokeWidth={3} />
                            PROTOCOL
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            className={cn(
                              "h-24 rounded-[1.5rem] border-4 text-2xl font-black gap-3",
                              timerValue === 0 ? "border-red-600 text-red-600" : "border-zinc-700 text-zinc-700 opacity-50"
                            )}
                            disabled={timerValue > 0}
                            onClick={() => setShowNoShowConfirm(booking.id)}
                          >
                            <UserMinus size={32} strokeWidth={3} />
                            NO SHOW
                          </Button>
                        )}
                      </div>
                      
                      {isTimerRunning && timerValue < 60 && (
                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-black uppercase tracking-widest justify-center animate-pulse">
                          <AlertTriangle size={18} />
                          Final Warning: Cancel in {formatTime(timerValue)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-xl font-black uppercase tracking-widest">
                      {booking.status === "picked_up" ? (
                        <span className="text-green-600 flex items-center gap-2 animate-in slide-in-from-left duration-300">
                          <CheckCircle2 size={28} strokeWidth={3} /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-2 animate-in slide-in-from-left duration-300">
                          <XCircle size={28} strokeWidth={3} /> CANCELED
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

        {/* One-Touch "Board All" Predictive Control */}
        {!allProcessed && stopBookings.length > 1 && (
          <Button 
            className={cn(
              "w-full h-24 rounded-[2.5rem] bg-primary text-white text-2xl font-black gap-4 mt-4 transition-all shadow-2xl active:scale-95 animate-pulse",
            )}
            onClick={handlePickupAll}
          >
            <UserCheck size={32} strokeWidth={3} />
            ONE-TOUCH VERIFY ALL
          </Button>
        )}

        {/* Support Escalation */}
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-20 rounded-[2rem] border-4 text-xl font-black gap-4 mt-4 transition-all border-destructive text-destructive bg-destructive/5"
          )}
          onClick={() => {
            toast({ 
              title: "Support Escalated", 
              description: "Emergency protocol active. Support team is joining the trip.",
              variant: "destructive" 
            });
            playFeedback("error");
          }}
        >
          <ShieldAlert size={28} strokeWidth={3} />
          ESCALATE TO SUPPORT
        </Button>
      </div>

      {/* Sticky Bottom Next Step Button */}
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
            {allProcessed ? "CONTINUE TRIP" : "PROCESSING..."}
            <Navigation size={32} fill="currentColor" className="rotate-90 ml-2" />
          </Button>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!showVerification} onOpenChange={() => setShowVerification(null)}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-[3rem] border-0",
          isDrivingMode ? "bg-zinc-900 text-white" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <UserPlus className="text-primary" size={32} />
              Verify Identity
            </DialogTitle>
            <DialogDescription className="font-bold uppercase tracking-widest text-xs opacity-50">
              Select verification method for boarding
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 grid grid-cols-3 gap-4">
            <button 
              onClick={() => setVerifyMethod("qr")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 transition-all",
                verifyMethod === "qr" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <QrCode size={32} className={verifyMethod === "qr" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">QR Scan</span>
            </button>
            <button 
              onClick={() => setVerifyMethod("code")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 transition-all",
                verifyMethod === "code" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <Hash size={32} className={verifyMethod === "code" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">PIN Code</span>
            </button>
            <button 
              onClick={() => setVerifyMethod("photo")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 transition-all",
                verifyMethod === "photo" ? "border-primary bg-primary/10" : "border-transparent bg-white/5"
              )}
            >
              <Camera size={32} className={verifyMethod === "photo" ? "text-primary" : "opacity-30"} />
              <span className="text-[10px] font-black uppercase">Photo ID</span>
            </button>
          </div>

          {verifyMethod === "code" && (
            <div className="px-2 pb-8">
              <Input 
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter 4-digit code"
                className="h-20 text-4xl font-black text-center tracking-[0.5em] rounded-2xl bg-white/5 border-white/10"
                maxLength={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full h-20 text-2xl font-black rounded-2xl transition-all bg-primary text-white"
              onClick={() => showVerification && handleVerify(showVerification)}
            >
              {verifyMethod === "qr" ? "ACTIVATE SCANNER" : "VERIFY & BOARD"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No Show Confirmation Dialog */}
      <Dialog open={!!showNoShowConfirm} onOpenChange={() => setShowNoShowConfirm(null)}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-[3rem] border-0",
          isDrivingMode ? "bg-zinc-900 text-white" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 text-red-500">
              <AlertCircle size={32} />
              Confirm No-Show
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 space-y-4">
            <p className="text-xl font-bold leading-tight">
              Are you sure you want to cancel this booking? This action is irreversible.
            </p>
            <div className="p-6 rounded-[2rem] bg-red-500/10 border-2 border-red-500/20">
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">Policy Enforcement</p>
              <ul className="text-sm font-bold opacity-70 space-y-1">
                <li>• Wait limit exceeded ({waitLimit} mins)</li>
                <li>• 50% cancellation fee applied</li>
                <li>• Incident reported to support</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3">
            <Button
              className="w-full h-20 text-2xl font-black rounded-2xl transition-all bg-red-600 text-white"
              onClick={() => showNoShowConfirm && handleNoShow(showNoShowConfirm)}
            >
              CONFIRM CANCELLATION
            </Button>
            <Button
              variant="ghost"
              className="w-full h-16 text-lg font-black uppercase opacity-50"
              onClick={() => setShowNoShowConfirm(null)}
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-[3rem] border-0",
          isDrivingMode ? "bg-zinc-900 text-white" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Settings className="text-primary" size={32} />
              Stop Settings
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">No-Show Wait Limit</label>
                <span className="text-xl font-black text-primary">{waitLimit} MINS</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map(l => (
                  <button 
                    key={l}
                    onClick={() => setWaitLimit(l)}
                    className={cn(
                      "h-16 rounded-2xl font-black uppercase text-sm border-2 transition-all",
                      waitLimit === l ? "bg-primary border-primary text-white" : "border-white/10 bg-white/5 opacity-50"
                    )}
                  >
                    {l}m
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-start gap-4">
              <Info className="text-primary shrink-0" size={24} />
              <p className="text-sm font-bold opacity-70 leading-tight">
                Wait limits are automatically enforced. SMS notifications are sent at the 50% mark.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full h-20 text-2xl font-black rounded-2xl transition-all bg-primary text-white"
              onClick={() => setShowSettings(false)}
            >
              SAVE SETTINGS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />
    </div>
  );
};

export default DriverPickupDetail;
