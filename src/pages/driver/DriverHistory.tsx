import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { trips, routes } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type FilterPeriod = "today" | "week" | "month";

const mockHistory = [
  { tripId: "trip-1", routeId: "rayon-a", date: "2026-03-25", time: "06:00", pax: 8, status: "completed" as const, earnings: 320000 },
  { tripId: "trip-2", routeId: "rayon-b", date: "2026-03-25", time: "09:00", pax: 5, status: "completed" as const, earnings: 200000 },
  { tripId: "trip-3", routeId: "rayon-a", date: "2026-03-24", time: "06:00", pax: 10, status: "completed" as const, earnings: 400000 },
  { tripId: "trip-4", routeId: "rayon-c", date: "2026-03-23", time: "07:00", pax: 6, status: "completed" as const, earnings: 240000 },
  { tripId: "trip-5", routeId: "rayon-b", date: "2026-03-20", time: "09:00", pax: 4, status: "cancelled" as const, earnings: 0 },
  { tripId: "trip-6", routeId: "rayon-a", date: "2026-03-18", time: "06:00", pax: 9, status: "completed" as const, earnings: 360000 },
];

const DriverHistory = () => {
  const navigate = useNavigate();
  const { isDrivingMode } = useDriver();
  const [filter, setFilter] = useState<FilterPeriod>("today");

  const filteredHistory = mockHistory.filter((h) => {
    const d = new Date(h.date);
    const now = new Date("2026-03-25");
    if (filter === "today") return h.date === "2026-03-25";
    if (filter === "week") {
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }
    return true;
  });

  const completedCount = filteredHistory.filter((h) => h.status === "completed").length;
  const totalPax = filteredHistory.reduce((sum, h) => sum + h.pax, 0);

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
          <h1 className="text-3xl font-black uppercase tracking-tight">Riwayat Trip</h1>
          <p className="text-sm font-bold uppercase tracking-widest opacity-70 mt-1">
            {completedCount} trip selesai · {totalPax} penumpang
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-4 space-y-6">
        {/* Filter Tabs */}
        <div className={cn(
          "flex gap-2 p-1.5 rounded-2xl",
          isDrivingMode ? "bg-zinc-900" : "bg-muted/50"
        )}>
          {(["today", "week", "month"] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                filter === p
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : isDrivingMode ? "text-white/40" : "text-muted-foreground"
              )}
            >
              {p === "today" ? "Hari Ini" : p === "week" ? "Minggu" : "Bulan"}
            </button>
          ))}
        </div>

        {/* Trip List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 opacity-50">
            <Clock size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Belum ada trip</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((trip, i) => {
              const route = routes.find((r) => r.id === trip.routeId);
              return (
                <Card key={i} className={cn(
                  "border-0 rounded-2xl overflow-hidden transition-all",
                  isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
                )}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight">{route?.name || trip.routeId}</p>
                        <div className="flex items-center gap-1.5 text-sm opacity-60 mt-0.5">
                          <MapPin size={14} />
                          <span>{route?.destination || "—"}</span>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-full text-[10px] font-black uppercase tracking-widest",
                        trip.status === "completed"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {trip.status === "completed" ? "Selesai" : "Batal"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-bold opacity-60">
                          <Clock size={14} /> {trip.time}
                        </span>
                        <span className="flex items-center gap-1 font-bold opacity-60">
                          <Users size={14} /> {trip.pax} PAX
                        </span>
                      </div>
                      {trip.earnings > 0 && (
                        <span className="font-black text-primary">
                          Rp {trip.earnings.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-40 mt-2 font-bold">{trip.date}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistory;
