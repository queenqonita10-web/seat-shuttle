import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Ticket as TicketIcon, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  Navigation,
  QrCode
} from "lucide-react";
import { userTickets, routes, formatPrice } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Tickets() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = useMemo(() => {
    return userTickets.filter(t => {
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      const route = routes.find(r => r.id === t.routeId);
      const matchesSearch = 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route?.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchTerm]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <div className="bg-zinc-900 text-white pt-16 pb-32 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-1">My Tickets</h1>
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Manage your bookings and track rides</p>
          </div>
          <div className="flex gap-4">
            <Badge className="bg-primary text-white border-none py-2 px-4 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-lg shadow-primary/20 animate-pulse">
              <Navigation size={14} className="mr-2" /> 1 Active Ride
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 space-y-6">
        {/* Filters */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
              <Input 
                placeholder="Search ticket ID or destination..." 
                className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none shadow-inner font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["all", "active", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap",
                    filterStatus === status 
                      ? "bg-zinc-900 text-white shadow-xl" 
                      : "bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200 shadow-sm"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-6">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              const route = routes.find(r => r.id === ticket.routeId);
              const isTracking = ticket.status === "active";

              return (
                <Card 
                  key={ticket.id} 
                  className={cn(
                    "border-none shadow-xl rounded-[2.5rem] overflow-hidden group transition-all hover:scale-[1.02] cursor-pointer",
                    isTracking ? "ring-4 ring-primary ring-opacity-10" : "opacity-90 grayscale-[0.5]"
                  )}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left Side: Ticket Info */}
                      <div className="flex-1 p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3">
                                {ticket.id}
                              </Badge>
                              {isTracking && (
                                <Badge className="bg-green-500 text-white border-none font-black text-[10px] px-3 animate-pulse">
                                  LIVE TRACKING
                                </Badge>
                              )}
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
                              {route?.origin} <ChevronRight className="inline text-primary" size={18} /> {route?.destination}
                            </h2>
                          </div>
                          <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-200 group-hover:border-primary transition-colors">
                            <QrCode size={32} className="text-zinc-200 group-hover:text-primary transition-colors" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Departure</p>
                            <div className="flex items-center gap-2 font-bold text-zinc-900">
                              <Calendar size={14} className="text-primary" />
                              {ticket.departureDate}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Time</p>
                            <div className="flex items-center gap-2 font-bold text-zinc-900">
                              <Clock size={14} className="text-primary" />
                              {ticket.departureTime}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Seat</p>
                            <div className="flex items-center gap-2 font-bold text-zinc-900">
                              <TicketIcon size={14} className="text-primary" />
                              #{ticket.seatNumber}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</p>
                            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                              {ticket.status === "active" ? (
                                <span className="text-green-600 flex items-center gap-1"><Timer size={12} /> ACTIVE</span>
                              ) : ticket.status === "completed" ? (
                                <span className="text-blue-600 flex items-center gap-1"><CheckCircle2 size={12} /> COMPLETED</span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1"><XCircle size={12} /> CANCELLED</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Quick Action/Indicator */}
                      <div className={cn(
                        "w-full md:w-32 flex items-center justify-center border-t md:border-t-0 md:border-l border-dashed transition-colors",
                        isTracking ? "bg-primary/5 border-primary/20" : "bg-zinc-50 border-zinc-200"
                      )}>
                        <Button variant="ghost" size="icon" className="h-full w-full rounded-none hover:bg-transparent">
                          <ChevronRight size={32} className={isTracking ? "text-primary" : "text-zinc-300"} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl">
              <TicketIcon size={64} className="mx-auto text-zinc-100 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-300 italic">No tickets found for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
