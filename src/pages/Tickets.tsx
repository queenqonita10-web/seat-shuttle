import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Ticket as TicketIcon, Calendar, Clock, Search,
  CheckCircle2, XCircle, Timer, Navigation, QrCode
} from "lucide-react";
import { useUserTickets } from "@/hooks/useTickets";
import { useRoutes } from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export default function Tickets() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: tickets = [], isLoading } = useUserTickets();
  const { data: routes = [] } = useRoutes();

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      const route = routes.find(r => r.id === t.route_id);
      const matchesSearch = 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchTerm, tickets, routes]);

  const activeCount = tickets.filter(t => t.status === "active").length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground pt-12 pb-8 px-5">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-1">My Tickets</h1>
          <p className="text-primary-foreground/70 text-xs">Manage your bookings and track rides</p>
          {activeCount > 0 && (
            <Badge className="mt-3 bg-destructive/90 text-destructive-foreground text-[10px] animate-pulse">
              <Navigation size={12} className="mr-1" /> {activeCount} Active Ride{activeCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search ticket or destination..." 
            className="pl-10 h-11 rounded-xl bg-muted border-none text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["all", "active", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap",
                filterStatus === status 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-40" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              const route = routes.find(r => r.id === ticket.route_id);
              const isTracking = ticket.status === "active";

              return (
                <Card 
                  key={ticket.id} 
                  className={cn(
                    "border-0 shadow-sm rounded-xl overflow-hidden transition-all active:scale-[0.98] cursor-pointer",
                    isTracking && "ring-2 ring-primary/20"
                  )}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground">{ticket.id}</span>
                          {isTracking && (
                            <Badge className="bg-secondary/20 text-secondary border-none text-[9px] px-2 py-0">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {route?.origin} → {route?.destination}
                        </p>
                      </div>
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <QrCode size={20} className="text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Date</p>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Calendar size={12} className="text-primary" />
                          {ticket.departure_date}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Time</p>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Clock size={12} className="text-primary" />
                          {ticket.departure_time}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Seat</p>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <TicketIcon size={12} className="text-primary" />
                          #{ticket.seat_number}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Status</p>
                        <div className="text-xs font-semibold">
                          {ticket.status === "active" ? (
                            <span className="text-secondary flex items-center gap-1"><Timer size={12} /> Active</span>
                          ) : ticket.status === "completed" ? (
                            <span className="text-primary flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>
                          ) : (
                            <span className="text-destructive flex items-center gap-1"><XCircle size={12} /> Cancelled</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16">
              <TicketIcon size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
