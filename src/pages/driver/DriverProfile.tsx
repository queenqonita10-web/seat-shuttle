import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { drivers } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, Star, Bus, Phone, LogOut, Moon, Bell, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { isDrivingMode, setIsDrivingMode, isOnline, setIsOnline, waitLimit, setWaitLimit, reset } = useDriver();

  const driver = drivers[0]; // current driver mock

  const handleLogout = () => {
    reset();
    navigate("/");
  };

  return (
    <div className={cn(
      "min-h-screen pb-8",
      isDrivingMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 pb-10 pt-14 shadow-2xl",
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

          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarFallback className="text-2xl font-black bg-white/10 text-inherit">
                {driver.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{driver.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm opacity-70">
                <span className="flex items-center gap-1 font-bold">
                  <Star size={14} fill="currentColor" /> 4.8
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Bus size={14} /> 156 trip
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-5 space-y-4">
        {/* Contact Info */}
        <Card className={cn(
          "border-0 rounded-2xl",
          isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Phone size={18} className="opacity-50" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-50">Telepon</p>
                <p className="font-bold">{driver.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-3 px-1">Pengaturan</p>
          <Card className={cn(
            "border-0 rounded-2xl",
            isDrivingMode ? "bg-zinc-900 ring-1 ring-white/10" : "bg-card"
          )}>
            <CardContent className="p-0 divide-y divide-border/10">
              {/* Dark/Driving Mode */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Moon size={18} className="opacity-50" />
                  <span className="font-bold text-sm">Mode Gelap (Driving)</span>
                </div>
                <Switch
                  checked={isDrivingMode}
                  onCheckedChange={setIsDrivingMode}
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="opacity-50" />
                  <span className="font-bold text-sm">Notifikasi</span>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Wait Limit */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="opacity-50" />
                  <div>
                    <span className="font-bold text-sm block">Batas Tunggu</span>
                    <span className="text-xs opacity-50">{waitLimit} menit per titik jemput</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWaitLimit(Math.max(3, waitLimit - 1))}
                    className={cn(
                      "w-8 h-8 rounded-full font-black text-lg flex items-center justify-center",
                      isDrivingMode ? "bg-white/10" : "bg-muted"
                    )}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-black">{waitLimit}</span>
                  <button
                    onClick={() => setWaitLimit(Math.min(15, waitLimit + 1))}
                    className={cn(
                      "w-8 h-8 rounded-full font-black text-lg flex items-center justify-center",
                      isDrivingMode ? "bg-white/10" : "bg-muted"
                    )}
                  >
                    +
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Logout */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            className={cn(
              "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm",
              isOnline
                ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
                : "border-green-500/30 text-green-500 hover:bg-green-500/10"
            )}
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm text-red-500 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
