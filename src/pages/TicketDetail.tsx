import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Navigation, 
  Info, 
  Phone, 
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Truck,
  QrCode,
  Share2,
  HelpCircle
} from "lucide-react";
import { userTickets, routes, drivers, formatPrice } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = userTickets.find(t => t.id === id);
  const route = routes.find(r => r.id === ticket?.routeId);
  const driver = drivers.find(d => d.id === "driver-1"); // Mock driver for tracking

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="text-center space-y-4">
          <Info size={48} className="mx-auto text-zinc-300" />
          <p className="text-xl font-black uppercase italic text-zinc-900 tracking-tighter">Ticket Not Found</p>
          <Button onClick={() => navigate("/tickets")} className="rounded-2xl font-black uppercase tracking-widest text-xs">Back to Tickets</Button>
        </div>
      </div>
    );
  }

  const isTracking = ticket.status === "active";

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header Sticky */}
      <div className="bg-zinc-900 text-white sticky top-0 z-50 px-6 py-6 border-b border-white/5 backdrop-blur-xl bg-zinc-900/90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/tickets")} className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
              <ChevronLeft size={24} />
            </Button>
            <div>
              <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none">Ticket Detail</h1>
              <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-widest">{ticket.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
              <Share2 size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
              <HelpCircle size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Real-time Tracking (Map Mockup) */}
        {isTracking && (
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white group ring-4 ring-primary ring-opacity-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-[300px] bg-zinc-100 relative overflow-hidden">
              {/* Fake Map Grid */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
              
              {/* Map UI Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/20 animate-ping absolute -inset-0" />
                  <div className="h-20 w-20 rounded-full bg-primary/40 animate-pulse absolute -inset-0" />
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center relative z-10 shadow-2xl shadow-primary/40 rotate-12">
                    <Truck size={24} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Destination Point */}
              <div className="absolute bottom-10 right-10">
                <div className="h-12 w-12 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-xl border-4 border-primary">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                  Pickup Point {ticket.pickupPointId}
                </div>
              </div>

              {/* Status Floating Card */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] text-white flex items-center justify-between border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
                      <img src={driver?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Driver"} alt="Driver" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">EN ROUTE</p>
                      <p className="text-lg font-black uppercase italic tracking-tighter">Arriving in 8 Mins</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full bg-primary text-white border-none hover:bg-primary/90 shadow-xl shadow-primary/30">
                    <Phone size={24} strokeWidth={3} />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-8 bg-zinc-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 italic">Speed</span>
                  <span className="text-xl font-black italic tracking-tighter">42 <span className="text-[10px] uppercase">km/h</span></span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 italic">Distance</span>
                  <span className="text-xl font-black italic tracking-tighter">1.4 <span className="text-[10px] uppercase">km</span></span>
                </div>
              </div>
              <Button className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8">View Map</Button>
            </CardContent>
          </Card>
        )}

        {/* Ticket Info Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-zinc-900 text-white pb-6">
              <CardTitle className="text-lg font-black uppercase italic tracking-tight">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 border-4 border-dashed border-zinc-200 flex items-center justify-center text-primary group-hover:border-primary transition-colors">
                  <QrCode size={40} className="text-zinc-200" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1 italic">E-Ticket ID</p>
                  <p className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">{ticket.id}</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-50">
                {[
                  { icon: MapPin, label: "Origin", value: route?.origin },
                  { icon: Navigation, label: "Destination", value: route?.destination },
                  { icon: Clock, label: "Departure", value: `${ticket.departureDate} @ ${ticket.departureTime}` },
                  { icon: ShieldCheck, label: "Seat Number", value: `#${ticket.seatNumber} (Regular)` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-primary border-2 border-zinc-100">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic mb-0.5">{item.label}</p>
                      <p className="font-black text-sm uppercase italic text-zinc-900 tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity/History Timeline */}
          <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white flex flex-col">
            <CardHeader className="bg-zinc-900 text-white pb-6">
              <CardTitle className="text-lg font-black uppercase italic tracking-tight">Ride Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1 space-y-8">
              <div className="relative space-y-8 pl-8">
                {/* Vertical Line */}
                <div className="absolute left-3 top-2 bottom-2 w-1 bg-zinc-100 rounded-full" />
                
                {ticket.history.map((h, i) => {
                  const isLast = i === ticket.history.length - 1;
                  return (
                    <div key={i} className="relative group">
                      {/* Node Dot */}
                      <div className={cn(
                        "absolute -left-[2.15rem] h-6 w-6 rounded-full border-4 border-white shadow-lg transition-all z-10",
                        isLast ? "bg-primary scale-125 animate-pulse" : "bg-zinc-200"
                      )} />
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isLast ? "text-primary" : "text-zinc-400"
                          )}>
                            {h.status.replace('_', ' ')}
                          </p>
                          <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={cn(
                          "font-bold text-sm tracking-tight",
                          isLast ? "text-zinc-900" : "text-zinc-400 italic"
                        )}>
                          {h.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3 pt-8 border-t border-zinc-50">
                <Button className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] shadow-xl italic">
                  Show QR E-Ticket
                </Button>
                {ticket.status === "active" && (
                  <Button variant="ghost" className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] italic">
                    Cancel Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
