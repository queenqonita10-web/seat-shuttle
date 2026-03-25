import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trips, routes, drivers, vehicles } from "@/data/mockData";
import { 
  Plus, 
  Copy, 
  UserPlus, 
  Calendar, 
  Clock, 
  MoreHorizontal,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTrips() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>;
      case "completed":
        return <Badge variant="secondary" className="opacity-70">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trip Scheduling</h2>
          <p className="text-sm text-muted-foreground mt-1">Assign routes, drivers, and manage daily operations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold">
            <Copy className="h-4 w-4 mr-2" /> Bulk Duplicate
          </Button>
          <Button className="font-bold">
            <Plus className="h-4 w-4 mr-2" /> Create Trip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Total Scheduled</p>
            <p className="text-3xl font-black">{trips.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-green-500">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-1">Active Now</p>
            <p className="text-3xl font-black">{trips.filter(t => t.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Available Seats</p>
            <p className="text-3xl font-black text-primary">142</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Drivers Online</p>
            <p className="text-3xl font-black">{drivers.filter(d => d.status !== "offline").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">Daily Trips Schedule</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4">Today</Button>
              <Button variant="outline" size="sm" className="h-9 px-4">Tomorrow</Button>
              <Button variant="outline" size="sm" className="h-9 px-9">
                <Calendar className="h-4 w-4 mr-2" /> Select Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 uppercase text-[10px] font-black tracking-widest">Trip ID</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Route / Zone</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Departure</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Driver</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Vehicle</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Load</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                <TableHead className="pr-6 text-right uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => {
                const route = routes.find(r => r.id === trip.routeId);
                const driver = drivers.find(d => d.id === trip.driverId);
                const vehicle = vehicles.find(v => v.id === trip.vehicleTypeId);
                const occupiedSeats = trip.seats.filter(s => s.status === "booked").length;
                const totalSeats = trip.seats.length;
                const occupancyRate = Math.round((occupiedSeats / totalSeats) * 100);

                return (
                  <TableRow key={trip.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6 font-bold text-sm">#{trip.id.toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <MapPin size={14} />
                        </div>
                        <span className="font-bold">{route?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="font-bold">{trip.departureTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {driver ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                            {driver.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{driver.name}</span>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 text-primary font-bold px-2 hover:bg-primary/5">
                          <UserPlus size={14} className="mr-2" /> Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span>{occupiedSeats}/{totalSeats}</span>
                          <span className={cn(
                            occupancyRate > 80 ? "text-red-500" : occupancyRate > 50 ? "text-amber-500" : "text-green-500"
                          )}>{occupancyRate}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              occupancyRate > 80 ? "bg-red-500" : occupancyRate > 50 ? "bg-amber-500" : "bg-green-500"
                            )} 
                            style={{ width: `${occupancyRate}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={14} />
                        </Button>
                      </div>
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
