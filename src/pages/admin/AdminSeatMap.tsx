import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trips, routes, mockBookings, seatLayoutTemplates, vehicles } from "@/data/mockData";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Armchair, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search,
  LayoutGrid,
  Info,
  Luggage
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSeatMap() {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id);
  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const route = routes.find(r => r.id === selectedTrip?.routeId);
  
  // Find vehicle and its template
  const vehicle = vehicles.find(v => v.vehicleTypeId === selectedTrip?.vehicleTypeId);
  const template = useMemo(() => {
    return seatLayoutTemplates.find(t => t.id === vehicle?.layoutTemplateId) || seatLayoutTemplates[0];
  }, [vehicle]);

  const tripBookings = mockBookings.filter(b => b.tripId === selectedTripId);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">Seat Management</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Real-time seat occupancy and manual overrides</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-4">Active Trip</p>
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger className="w-[350px] border-none shadow-none font-black text-zinc-900 uppercase italic focus:ring-0">
              <SelectValue placeholder="Choose a trip" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2">
              {trips.map(t => {
                const r = routes.find(route => route.id === t.routeId);
                return (
                  <SelectItem key={t.id} value={t.id} className="font-bold uppercase text-xs italic py-3">
                    {r?.routeCode} • {r?.name} • {t.departureTime}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Seat Layout Grid */}
        <Card className="lg:col-span-8 border-none shadow-xl overflow-hidden rounded-3xl bg-white">
          <CardHeader className="border-b bg-zinc-900 text-white pb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase italic tracking-tight">{template.name}</CardTitle>
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">
                    {vehicle?.licensePlate} • {vehicle?.brand} {vehicle?.model}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-100 border-2 border-zinc-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">VIP</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-16 flex justify-center bg-zinc-50/50">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-[12px] border-zinc-100 relative min-w-[400px]">
              {/* Front Indicator */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] italic shadow-xl z-20 border-2 border-primary/20">
                ▲ Front
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${template.cols}, minmax(0, 1fr))` }}>
                {template.layout.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const booking = cell.seatNumber ? tripBookings.find(b => b.seatNumber === cell.seatNumber) : null;
                    const isVip = cell.type === "seat-vip";
                    const isPremium = cell.type === "seat-premium";

                    return (
                      <div key={`${rIdx}-${cIdx}`} className="relative group flex justify-center">
                        {cell.type === "empty" ? (
                          <div className="h-16 w-16" />
                        ) : (
                          <button
                            className={cn(
                              "h-16 w-16 rounded-2xl border-4 flex flex-col items-center justify-center transition-all relative z-10",
                              booking 
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110" 
                                : isVip 
                                  ? "bg-zinc-900 border-zinc-900 text-white shadow-xl" 
                                  : isPremium
                                    ? "bg-blue-50 border-blue-200 text-blue-600"
                                    : cell.type === "driver"
                                      ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-default"
                                      : cell.type === "baggage"
                                        ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-default"
                                        : "bg-white border-zinc-100 hover:border-primary/50 text-zinc-400"
                            )}
                          >
                            {cell.type === "driver" ? <Users size={20} /> :
                             cell.type === "baggage" ? <Luggage size={20} /> :
                             <Armchair size={24} strokeWidth={booking ? 3 : 2} />}
                            
                            {cell.seatNumber && (
                              <span className={cn(
                                "text-[10px] font-black mt-1",
                                booking ? "text-white" : isVip ? "text-primary" : "text-zinc-500"
                              )}>
                                #{cell.seatNumber}
                              </span>
                            )}
                          </button>
                        )}
                        
                        {booking && (
                          <div className="absolute -top-2 -right-2 h-7 w-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center z-20 shadow-lg">
                            <CheckCircle2 size={12} className="text-white" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Entrance Step */}
              <div className="mt-16 pt-8 border-t-4 border-dashed border-zinc-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">Entrance Door</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manifest Detail Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-zinc-900 text-white pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase italic tracking-tight">Trip Manifest</CardTitle>
                <Badge className="bg-primary text-white border-none font-black text-[10px]">
                  {tripBookings.length} BOARDED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {tripBookings.length > 0 ? tripBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-primary/5 transition-all cursor-pointer border-2 border-transparent hover:border-primary/20 group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border-2 border-zinc-100 group-hover:border-primary/30">
                      <span className="text-[8px] font-black text-zinc-400 uppercase leading-none mb-1">Seat</span>
                      <span className="text-sm font-black text-primary italic leading-none">#{booking.seatNumber}</span>
                    </div>
                    <div>
                      <p className="font-black text-zinc-900 uppercase italic text-sm">{booking.passengerName}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">{booking.pickupPointId}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300 group-hover:text-primary transition-colors" />
                </div>
              )) : (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-zinc-100 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-300 italic">No passengers boarded</p>
                </div>
              )}
              
              <div className="pt-6 space-y-3">
                <Button className="w-full font-black h-14 rounded-2xl uppercase tracking-widest shadow-lg shadow-primary/20 italic">
                  Manual Seat Override
                </Button>
                <Button variant="outline" className="w-full font-black h-14 rounded-2xl text-zinc-400 border-2 uppercase tracking-widest">
                  <Lock size={16} className="mr-2 text-zinc-300" /> Block Seats
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex gap-5 shadow-inner">
            <Info className="text-amber-500 shrink-0" size={28} />
            <div>
              <p className="text-sm font-black uppercase italic text-amber-900 tracking-tight">Occupancy Alert</p>
              <p className="text-xs font-bold text-amber-800/70 leading-relaxed mt-2 italic">
                Trip ini mendekati kapasitas maksimal. Pemblokiran kursi manual dibatasi untuk mengoptimalkan pendapatan rute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
