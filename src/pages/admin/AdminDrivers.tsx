import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { drivers, trips, routes } from "@/data/mockData";
import { Users, Phone, Bus, MoreHorizontal, CheckCircle2, Circle } from "lucide-react";

export default function AdminDrivers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Driver Management</h2>
        <Button>
          <Users className="h-4 w-4 mr-2" /> Add Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active on Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {drivers.filter(d => d.status === "on_trip").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online (Idle)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {drivers.filter(d => d.status === "online").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drivers List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Trip</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => {
                const activeTrip = trips.find(t => t.driverId === driver.id && t.status === "active");
                const route = activeTrip ? routes.find(r => r.id === activeTrip.routeId) : null;

                return (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {driver.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {driver.status === "on_trip" && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          On Trip
                        </Badge>
                      )}
                      {driver.status === "online" && (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                          Online
                        </Badge>
                      )}
                      {driver.status === "offline" && (
                        <Badge variant="secondary" className="opacity-50">
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {route ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Bus className="h-4 w-4 text-primary" />
                          {route.name} ({activeTrip?.departureTime})
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No active trip</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
