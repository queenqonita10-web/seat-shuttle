import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Home, MapPin, Navigation, UserCheck, 
  UserMinus, XCircle, Trophy, Clock, Star, ArrowRight,
  Zap, Brain, Activity, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const DriverTripSummary = () => {
  const navigate = useNavigate();
  const { 
    activeTrip, bookings, reset, isDrivingMode, playFeedback, 
    performance, stressLevel, fatigueLevel, difficulty 
  } = useDriver();

  if (!activeTrip) {
    navigate("/driver");
    return null;
  }

  const total = bookings.length;
  const pickedUp = bookings.filter(b => b.status === "picked_up").length;
  const noShows = bookings.filter(b => b.status === "no_show").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  
  // Calculate simulation score
  const baseScore = (pickedUp / total) * 100;
  const stressPenalty = stressLevel * 0.5;
  const fatiguePenalty = fatigueLevel * 0.5;
  const difficultyBonus = difficulty === "pro" ? 50 : difficulty === "hard" ? 30 : difficulty === "normal" ? 10 : 0;
  const finalScore = Math.max(0, Math.round(baseScore - stressPenalty - fatiguePenalty + difficultyBonus));
  
  const successRate = total > 0 ? Math.round((pickedUp / total) * 100) : 0;

  const handleFinish = () => {
    reset();
    playFeedback("action");
    navigate("/driver");
  };

  return (
    <div className={cn(
      "min-h-screen pb-12 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* High Contrast Header with Achievement Feel */}
      <div className={cn(
        "px-6 pb-28 pt-20 text-center transition-all duration-500 shadow-2xl relative overflow-hidden",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <Trophy size={300} strokeWidth={1} className="rotate-12" />
        </div>
        
        <div className="mx-auto max-w-md relative z-10">
          <div className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
            <CheckCircle2 size={60} strokeWidth={3} className="text-white" />
          </div>
          <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter italic leading-none">PYU-GO COMPLETE</h1>
          <Badge className="bg-white text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-2">
            DIFFICULTY: {difficulty}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-20 space-y-6 relative z-20">
        {/* Final Score Card */}
        <div className={cn(
          "p-8 rounded-[2.5rem] flex items-center justify-between border-4 shadow-2xl",
          isDrivingMode ? "bg-zinc-900 border-white/10" : "bg-white border-primary/10"
        )}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Overall Driver Score</p>
            <h2 className="text-6xl font-black tracking-tighter text-primary">{finalScore}</h2>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={20} 
                  fill={s <= Math.ceil(finalScore / 20) ? "#eab308" : "transparent"} 
                  className={s <= Math.ceil(finalScore / 20) ? "text-yellow-500" : "opacity-20"}
                />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Elite Captain Status</p>
          </div>
        </div>

        {/* Simulation Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={cn(
            "border-0 rounded-[2rem] shadow-xl overflow-hidden",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-yellow-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Avg Reaction</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black tracking-tighter">{performance.reactionTime || 850}ms</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-0 rounded-[2rem] shadow-xl overflow-hidden",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={14} className="text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Max Stress</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black tracking-tighter">{Math.round(stressLevel)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className={cn(
            "border-0 rounded-[2rem] shadow-xl overflow-hidden",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Accuracy</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black tracking-tighter">{performance.decisionAccuracy}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-0 rounded-[2rem] shadow-xl overflow-hidden",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-green-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Success Rate</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black tracking-tighter">{successRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Boarding Breakdown */}
        <Card className={cn(
          "shadow-2xl border-0 overflow-hidden rounded-[2.5rem]",
          isDrivingMode ? "bg-zinc-900 ring-1 ring-white/20" : "bg-white"
        )}>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-white/5">
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Boarded</p>
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
          className="w-full h-24 rounded-[2.5rem] text-3xl font-black gap-4 shadow-2xl shadow-primary/40 mt-6 active:translate-y-1 transition-all"
          onClick={handleFinish}
        >
          <Home size={32} strokeWidth={3} />
          END SIMULATION
          <ArrowRight size={32} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
};

export default DriverTripSummary;
