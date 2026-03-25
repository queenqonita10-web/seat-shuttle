import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  mockBookings, 
  trips, 
  routes, 
  formatPrice, 
  getFareForPickup 
} from "@/data/mockData";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Calendar, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  RefreshCcw 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminBookings() {
  const [search, setSearch] = useState("");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const filteredBookings = mockBookings.filter(b => 
    b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage passenger manifests, seats, and payment status</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button className="font-bold">
            Create Booking
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9 h-10 bg-muted/20 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-10 px-4 font-bold border-muted">
                <Calendar className="h-4 w-4 mr-2" /> Date
              </Button>
              <Button variant="outline" size="sm" className="h-10 px-4 font-bold border-muted">
                <Filter className="h-4 w-4 mr-2" /> Route
              </Button>
              <Button variant="outline" size="sm" className="h-10 px-4 font-bold border-muted">
                Status <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedBookings.length > 0 && (
            <div className="bg-primary/5 p-3 px-6 border-b flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <p className="text-sm font-bold text-primary">
                {selectedBookings.length} bookings selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 bg-white text-xs font-bold">
                  <RefreshCcw size={12} className="mr-2" /> Reschedule
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-white text-xs font-bold text-red-600 hover:text-red-700">
                  <Trash2 size={12} className="mr-2" /> Cancel Bulk
                </Button>
              </div>
            </div>
          )}
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[50px] pl-6">
                  <Checkbox 
                    checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Booking ID</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Passenger</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Route & Stop</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Seat</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Payment</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                <TableHead className="pr-6 text-right uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const trip = trips.find(t => t.id === booking.tripId);
                const route = trip ? routes.find(r => r.id === trip.routeId) : null;
                const fare = route ? getFareForPickup(route, booking.pickupPointId) : 0;

                return (
                  <TableRow 
                    key={booking.id} 
                    className={cn(
                      "group hover:bg-muted/30 transition-colors",
                      selectedBookings.includes(booking.id) && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <TableCell className="pl-6">
                      <Checkbox 
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={() => toggleSelect(booking.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-[10px] font-bold text-muted-foreground">
                      #{booking.id.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {booking.passengerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-none">{booking.passengerName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{booking.passengerPhone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-bold">{route?.name}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-wider mt-0.5">
                          {booking.pickupPointId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black text-xs border-primary/20 bg-primary/5 text-primary rounded-md">
                        #{booking.seatNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs font-bold">{formatPrice(fare || 0)}</p>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-1.5 py-0 rounded-sm",
                          booking.paymentStatus === "paid" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-black uppercase border-none",
                        (booking as any).status === "picked_up" ? "bg-green-500/10 text-green-600" : 
                        (booking as any).status === "no_show" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                      )}>
                        {((booking as any).status || "pending").replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 cursor-pointer">
                            <Edit3 size={14} className="mr-2" /> Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 cursor-pointer">
                            <RefreshCcw size={14} className="mr-2" /> Change Seat
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 size={14} className="mr-2" /> Cancel Trip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
