import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trips, routes, mockBookings } from "@/data/mockData";
import { useState } from "react";
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
  Info
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSeatMap() {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id);
  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const route = routes.find(r => r.id === selectedTrip?.routeId);
  
  const tripBookings = mockBookings.filter(b => b.tripId === selectedTripId);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seat Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time seat occupancy and manual overrides</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-4">Select Trip</p>
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger className="w-[300px] border-none shadow-none font-bold text-primary focus:ring-0">
              <SelectValue placeholder="Choose a trip" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {trips.map(t => {
                const r = routes.find(route => route.id === t.routeId);
                return (
                  <SelectItem key={t.id} value={t.id} className="font-medium rounded-lg">
                    {r?.name} • {t.departureTime}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Seat Layout Grid */}
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Vehicle Layout</CardTitle>
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                    {selectedTrip?.vehicleTypeId.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted border" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Blocked</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12 flex justify-center bg-muted/5">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-8 border-muted/20 relative max-w-md w-full">
              {/* Driver Area */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex justify-between w-3/4 mb-12">
                <div className="h-12 w-12 rounded-xl bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Users size={20} className="opacity-20" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-zinc-100 border-4 border-zinc-200 flex items-center justify-center shadow-inner">
                  <Armchair size={24} className="text-zinc-400" />
                </div>
              </div>

              <div className="mt-24 grid grid-cols-2 gap-x-16 gap-y-8">
                {selectedTrip?.seats.map((seat) => {
                  const booking = tripBookings.find(b => b.seatNumber === seat.id);
                  const isBlocked = seat.id === "05"; // mock blocked seat

                  return (
                    <div key={seat.id} className="relative group">
                      <button
                        className={cn(
                          "h-20 w-20 rounded-[1.5rem] border-4 flex flex-col items-center justify-center transition-all relative z-10",
                          booking 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105" 
                            : isBlocked 
                              ? "bg-zinc-800 border-zinc-800 text-white" 
                              : "bg-white border-muted hover:border-primary/50 text-muted-foreground"
                        )}
                      >
                        <Armchair size={24} strokeWidth={booking ? 3 : 2} />
                        <span className="text-[10px] font-black mt-1">#{seat.id}</span>
                      </button>
                      
                      {booking && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center z-20 shadow-sm">
                          <CheckCircle2 size={10} className="text-white" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Entrance Step */}
              <div className="mt-12 pt-8 border-t-4 border-dashed border-muted/30 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Entrance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manifest Detail Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Trip Manifest</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Users size={14} />
                {tripBookings.length} Passengers Boarded
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tripBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-primary/10 group">
                  <div className="flex items-center gap-3">
                    <Badge className="h-10 w-10 rounded-xl bg-white text-primary border-none shadow-sm flex items-center justify-center text-xs font-black">
                      #{booking.seatNumber}
                    </Badge>
                    <div>
                      <p className="font-bold text-sm leading-none">{booking.passengerName}</p>
                      <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">{booking.pickupPointId}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              ))}
              
              <div className="pt-4 space-y-3">
                <Button className="w-full font-bold h-12 rounded-xl">
                  Manual Seat Override
                </Button>
                <Button variant="outline" className="w-full font-bold h-12 rounded-xl text-zinc-500">
                  <Lock size={14} className="mr-2" /> Block Seats
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
            <Info className="text-amber-500 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-amber-800">Occupancy Alert</p>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                This trip is nearing capacity. Manual seat blocking is restricted to ensure maximum revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
