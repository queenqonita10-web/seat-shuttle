import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { trips, routes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, Clock, MapPin, Power, Play, CheckCircle2, Fuel, Battery, ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceCommandLayer } from "@/components/VoiceCommandLayer";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { isOnline, setIsOnline, setActiveTrip, isDrivingMode, setIsDrivingMode, playFeedback } = useDriver();
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState({
    vehicle: false,
    fuel: false,
    battery: false,
  });

  const assignedTrip = trips[0];
  const route = routes.find((r) => r.id === assignedTrip.routeId);

  const handleStartTrip = () => {
    if (!checklist.vehicle || !checklist.fuel || !checklist.battery) {
      setShowChecklist(true);
      return;
    }
    setActiveTrip(assignedTrip);
    navigate("/driver/trip");
  };

  const handleConfirmChecklist = () => {
    setShowChecklist(false);
    setActiveTrip(assignedTrip);
    navigate("/driver/trip");
  };

  const isChecklistComplete = checklist.vehicle && checklist.fuel && checklist.battery;

  const handleVoiceCommand = (command: string) => {
    if (command === "start trip") {
      handleStartTrip();
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-24 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header */}
      <div className={cn(
        "px-6 pb-12 pt-16 shadow-2xl",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">SHUTTLE GO</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", isOnline ? "bg-green-500" : "bg-red-500")} />
              <p className="text-sm font-black uppercase tracking-widest opacity-80">
                {isOnline ? "Captain Online" : "System Offline"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              playFeedback("action");
            }}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 border-4 shadow-2xl",
              isOnline 
                ? "bg-green-600 border-white text-white shadow-green-500/20" 
                : "bg-zinc-800 border-white/20 text-white/40"
            )}
          >
            <Power size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-8 space-y-6">
        {/* Main Action Card - Predictive Suggestion */}
        <Card className={cn(
          "border-0 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 transform active:scale-[0.98]",
          isDrivingMode ? "bg-zinc-900 ring-1 ring-white/20" : "bg-white"
        )}>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-8">
              <Badge className={cn(
                "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                isDrivingMode ? "bg-white text-black" : "bg-primary text-white"
              )}>
                NEXT MISSION
              </Badge>
              <div className="flex items-center gap-2 text-xl font-black">
                <Clock size={24} strokeWidth={3} />
                {assignedTrip.departureTime}
              </div>
            </div>

            <h2 className="text-4xl font-black leading-tight mb-2 tracking-tight uppercase">
              {route?.name}
            </h2>
            <div className="flex items-center gap-2 text-xl font-bold opacity-60 mb-10">
              <MapPin size={24} />
              <span>To: {route?.destination}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className={cn("rounded-3xl p-5", isDrivingMode ? "bg-white/5" : "bg-muted/50")}>
                <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">Bus</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <Bus size={24} strokeWidth={3} />
                  HIACE-10
                </p>
              </div>
              <div className={cn("rounded-3xl p-5", isDrivingMode ? "bg-white/5" : "bg-muted/50")}>
                <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">PAX</p>
                <p className="text-3xl font-black tracking-tighter">4 <span className="text-sm opacity-50 font-bold uppercase tracking-widest ml-1">Confirmed</span></p>
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-24 text-3xl font-black gap-4 rounded-[2rem] shadow-2xl transition-all active:translate-y-1 active:shadow-none",
                isOnline 
                  ? "bg-primary text-white shadow-primary/40 hover:bg-primary/90" 
                  : "bg-zinc-800 text-white/20 cursor-not-allowed"
              )}
              onClick={handleStartTrip}
              disabled={!isOnline}
            >
              <Play fill="currentColor" size={40} strokeWidth={0} className="ml-2" />
              START TRIP
            </Button>
            {!isOnline && (
              <p className="text-center text-sm font-black text-red-500 mt-6 uppercase tracking-widest animate-bounce">
                Please go online to start
              </p>
            )}
          </CardContent>
        </Card>

        {/* Glanceable Stats - High Contrast */}
        <div className="grid grid-cols-2 gap-4 pb-12">
          <button className={cn(
            "p-6 rounded-[2rem] text-left transition-all active:scale-95 min-h-[100px]",
            isDrivingMode ? "bg-zinc-900 border border-white/10" : "bg-muted/50"
          )}>
            <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">Today's Progress</p>
            <p className="text-4xl font-black tracking-tighter">0<span className="text-xl opacity-30"> / 3</span></p>
          </button>
          <button className={cn(
            "p-6 rounded-[2rem] text-left transition-all active:scale-95 min-h-[100px]",
            isDrivingMode ? "bg-zinc-900 border border-white/10" : "bg-muted/50"
          )}>
            <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">Daily Income</p>
            <p className="text-2xl font-black tracking-tighter">Rp 0</p>
          </button>
        </div>
      </div>

      {/* Driving Mode Toggle (Simulate Physical Button) */}
      <button 
        onClick={() => {
          setIsDrivingMode(!isDrivingMode);
          playFeedback("action");
        }}
        className={cn(
          "fixed bottom-24 left-6 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-4 shadow-2xl transition-all active:scale-90",
          isDrivingMode ? "bg-white border-primary text-black" : "bg-zinc-900 border-white/20 text-white"
        )}
      >
        <div className="text-[10px] font-black uppercase mb-1">{isDrivingMode ? "LIGHT" : "DARK"}</div>
        <div className="w-8 h-1 bg-current rounded-full" />
      </button>

      <VoiceCommandLayer onCommand={handleVoiceCommand} />

      {/* Pre-Trip Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-[2rem] border-0",
          isDrivingMode ? "bg-zinc-900 text-white" : "bg-white"
        )}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-primary" size={32} />
              Pre-Trip Checklist
            </DialogTitle>
            <DialogDescription className={cn(
              "font-bold uppercase tracking-widest text-xs",
              isDrivingMode ? "text-white/50" : "text-muted-foreground"
            )}>
              Verify all safety protocols before starting
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 space-y-6">
            <div 
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl transition-all",
                checklist.vehicle ? "bg-primary/10 border-primary/20 border-2" : (isDrivingMode ? "bg-white/5 border-2 border-transparent" : "bg-muted/50 border-2 border-transparent")
              )}
              onClick={() => setChecklist(prev => ({ ...prev, vehicle: !prev.vehicle }))}
            >
              <div className="flex items-center gap-4">
                <Bus className={cn(checklist.vehicle ? "text-primary" : "opacity-40")} size={28} />
                <span className="font-black uppercase tracking-tight text-lg">Vehicle Ready</span>
              </div>
              <Checkbox 
                checked={checklist.vehicle} 
                className="w-8 h-8 rounded-full border-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            <div 
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl transition-all",
                checklist.fuel ? "bg-primary/10 border-primary/20 border-2" : (isDrivingMode ? "bg-white/5 border-2 border-transparent" : "bg-muted/50 border-2 border-transparent")
              )}
              onClick={() => setChecklist(prev => ({ ...prev, fuel: !prev.fuel }))}
            >
              <div className="flex items-center gap-4">
                <Fuel className={cn(checklist.fuel ? "text-primary" : "opacity-40")} size={28} />
                <span className="font-black uppercase tracking-tight text-lg">Fuel Sufficient</span>
              </div>
              <Checkbox 
                checked={checklist.fuel} 
                className="w-8 h-8 rounded-full border-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            <div 
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl transition-all",
                checklist.battery ? "bg-primary/10 border-primary/20 border-2" : (isDrivingMode ? "bg-white/5 border-2 border-transparent" : "bg-muted/50 border-2 border-transparent")
              )}
              onClick={() => setChecklist(prev => ({ ...prev, battery: !prev.battery }))}
            >
              <div className="flex items-center gap-4">
                <Battery className={cn(checklist.battery ? "text-primary" : "opacity-40")} size={28} />
                <span className="font-black uppercase tracking-tight text-lg">Phone Charged</span>
              </div>
              <Checkbox 
                checked={checklist.battery} 
                className="w-8 h-8 rounded-full border-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className={cn(
                "w-full h-20 text-2xl font-black rounded-2xl transition-all",
                isChecklistComplete ? "bg-primary text-white" : "bg-zinc-800 text-white/20"
              )}
              disabled={!isChecklistComplete}
              onClick={handleConfirmChecklist}
            >
              ALL SYSTEMS READY
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDashboard;
