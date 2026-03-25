import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { routes } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const weeklyData = [
  { day: "Sen", amount: 520000 },
  { day: "Sel", amount: 400000 },
  { day: "Rab", amount: 680000 },
  { day: "Kam", amount: 320000 },
  { day: "Jum", amount: 560000 },
  { day: "Sab", amount: 720000 },
  { day: "Min", amount: 0 },
];

const tripBreakdown = [
  { routeId: "rayon-a", time: "06:00", pax: 8, amount: 320000 },
  { routeId: "rayon-b", time: "09:00", pax: 5, amount: 200000 },
];

const maxAmount = Math.max(...weeklyData.map((d) => d.amount));

const DriverEarnings = () => {
  const navigate = useNavigate();
  const { isDrivingMode } = useDriver();

  const todayTotal = tripBreakdown.reduce((s, t) => s + t.amount, 0);
  const weekTotal = weeklyData.reduce((s, d) => s + d.amount, 0);

  return (
    <div className={cn(
      "min-h-screen pb-8",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 pb-8 pt-14 shadow-2xl",
        isDrivingMode ? "bg-zinc-900 border-b border-white/10" : "bg-primary text-primary-foreground"
      )}>
        <div className="mx-auto max-w-md">
          <Button
            variant="ghost"
            size="icon"
            className="mb-4 -ml-2 text-inherit hover:bg-white/10"
            onClick={() => navigate("/driver")}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-3xl font-black uppercase tracking-tight">Pendapatan</h1>
          <p className="text-sm font-bold uppercase tracking-widest opacity-70 mt-1">
            Detail penghasilan harian & mingguan
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={cn(
            "border-0 rounded-2xl",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
          )}>
            <CardContent className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Hari Ini</p>
              <p className="text-2xl font-black tracking-tighter">
                Rp {todayTotal.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
          <Card className={cn(
            "border-0 rounded-2xl",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
          )}>
            <CardContent className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Minggu Ini</p>
              <p className="text-2xl font-black tracking-tighter">
                Rp {weekTotal.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Bar Chart */}
        <Card className={cn(
          "border-0 rounded-2xl",
          isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-primary" />
              <p className="text-xs font-black uppercase tracking-widest opacity-60">Grafik Mingguan</p>
            </div>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-lg transition-all",
                      d.amount > 0 ? "bg-primary" : isDrivingMode ? "bg-white/5" : "bg-muted"
                    )}
                    style={{ height: d.amount > 0 ? `${(d.amount / maxAmount) * 100}%` : "4px" }}
                  />
                  <span className="text-[10px] font-black opacity-50">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today Breakdown */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-3 px-1">
            Breakdown Hari Ini
          </p>
          <div className="space-y-3">
            {tripBreakdown.map((trip, i) => {
              const route = routes.find((r) => r.id === trip.routeId);
              return (
                <Card key={i} className={cn(
                  "border-0 rounded-2xl",
                  isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
                )}>
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="font-black uppercase tracking-tight">{route?.name || trip.routeId}</p>
                      <div className="flex items-center gap-3 text-sm opacity-60 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {trip.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {trip.pax} PAX
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-black text-primary">
                      Rp {trip.amount.toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;
