import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, MapPin, Clock, Calendar, Navigation, Info, Phone, ShieldCheck,
  CheckCircle2, Clock3, Truck, QrCode, Share2, HelpCircle
} from "lucide-react";
import { userTickets, routes, drivers, formatPrice } from "@/data/mockData";
import { TrackingService, LocationUpdate } from "@/services/trackingService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(userTickets.find(t => t.id === id));
  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);
  
  const route = routes.find(r => r.id === ticket?.routeId);
  const driver = drivers.find(d => d.id === "driver-1");

  useEffect(() => {
    if (!ticket || ticket.status !== "active" || !driver) return;
    const pollTracking = async () => {
      try {
        const location = await TrackingService.getLastKnownLocation(driver.id);
        if (location) setDriverLocation(location);
      } catch (error) {
        console.error("Failed to fetch tracking data", error);
      }
    };
    pollTracking();
    const interval = setInterval(pollTracking, 5000);
    return () => clearInterval(interval);
  }, [ticket, driver]);

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-5">
        <div className="text-center space-y-3">
          <Info size={40} className="mx-auto text-muted-foreground/30" />
          <p className="text-lg font-bold text-foreground">Ticket Not Found</p>
          <Button onClick={() => navigate("/tickets")} className="rounded-xl text-sm">Back to Tickets</Button>
        </div>
      </div>
    );
  }

  const isTracking = ticket.status === "active";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground sticky top-0 z-50 px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/tickets")} className="h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="text-sm font-bold leading-none">Ticket Detail</p>
              <p className="text-[10px] text-primary-foreground/60 mt-0.5">{ticket.id}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Share2 size={16} />
            </button>
            <button className="h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <HelpCircle size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-4 space-y-4">
        {/* Tracking Card */}
        {isTracking && (
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden ring-2 ring-primary/10">
            <div className="h-40 bg-muted relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-primary/20 animate-ping absolute -inset-1" />
                  <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center relative z-10 shadow-lg">
                    <Truck size={20} />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-card/90 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                      <img src={driver?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Driver"} alt="Driver" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary font-semibold uppercase">En Route</p>
                      <p className="text-sm font-bold text-foreground">Arriving in 8 mins</p>
                    </div>
                  </div>
                  <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground">
                    <Phone size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Booking Details */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <QrCode size={24} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">E-Ticket ID</p>
                <p className="text-base font-bold text-foreground">{ticket.id}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border">
              {[
                { icon: MapPin, label: "Origin", value: route?.origin },
                { icon: Navigation, label: "Destination", value: route?.destination },
                { icon: Clock, label: "Departure", value: `${ticket.departureDate} · ${ticket.departureTime}` },
                { icon: ShieldCheck, label: "Seat", value: `#${ticket.seatNumber} (Regular)` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ride Timeline</p>
            <div className="relative space-y-4 pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-border rounded-full" />
              {ticket.history.map((h, i) => {
                const isLast = i === ticket.history.length - 1;
                return (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-[1.15rem] h-4 w-4 rounded-full border-2 border-card z-10",
                      isLast ? "bg-primary" : "bg-muted-foreground/30"
                    )} />
                    <div className="flex items-center justify-between">
                      <p className={cn("text-xs font-semibold capitalize", isLast ? "text-primary" : "text-muted-foreground")}>
                        {h.status.replace('_', ' ')}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={cn("text-xs mt-0.5", isLast ? "text-foreground" : "text-muted-foreground")}>
                      {h.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <Button className="w-full h-11 rounded-xl text-sm">
                Show QR E-Ticket
              </Button>
              {ticket.status === "active" && (
                <Button variant="ghost" className="w-full h-11 rounded-xl text-sm text-destructive hover:bg-destructive/10">
                  Cancel Booking
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
