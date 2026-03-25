import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTrips } from "@/hooks/admin/useAdminTrips";
import { useAdminDrivers } from "@/hooks/admin/useAdminDrivers";
import { 
  Plus, Copy, UserPlus, Calendar, Clock, MoreHorizontal, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTrips() {
  const { data: trips = [], isLoading } = useAdminTrips();
  const { data: drivers = [] } = useAdminDrivers();

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

  const activeTrips = trips.filter(t => t.status === "active");
  const onlineDrivers = drivers.filter(d => d.status !== "offline");

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
            <p className="text-3xl font-black">{activeTrips.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Available Seats</p>
            <p className="text-3xl font-black text-primary">—</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Drivers Online</p>
            <p className="text-3xl font-black">{onlineDrivers.length}</p>
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
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="pl-6 uppercase text-[10px] font-black tracking-widest">Trip ID</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest">Route</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest">Departure</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest">Driver</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest">Vehicle</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                  <TableHead className="pr-6 text-right uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => {
                  const routeName = trip.routes?.name ?? "—";
                  const driverName = trip.drivers?.name;
                  const vehicleLabel = trip.vehicles ? `${trip.vehicles.brand} ${trip.vehicles.model}` : "—";

                  return (
                    <TableRow key={trip.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 font-bold text-sm font-mono">#{trip.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                            <MapPin size={14} />
                          </div>
                          <span className="font-bold">{routeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="font-bold">{trip.departure_time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {driverName ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                              {driverName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{driverName}</span>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 text-primary font-bold px-2 hover:bg-primary/5">
                            <UserPlus size={14} className="mr-2" /> Assign
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-muted-foreground">{vehicleLabel}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
