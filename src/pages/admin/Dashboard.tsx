import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { BookOpen, Bus, Users, DollarSign, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockBookings, getBookingsByDay, trips, routes, formatPrice, getFareForPickup } from "@/data/mockData";

const chartConfig = {
  bookings: { label: "Bookings", color: "hsl(var(--primary))" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toDateString();
  const todayBookings = mockBookings.filter(b => new Date(b.createdAt).toDateString() === today);
  const paidBookings = mockBookings.filter(b => b.paymentStatus === "paid");
  const totalRevenue = paidBookings.reduce((sum, b) => {
    const trip = trips.find(t => t.id === b.tripId);
    if (!trip) return sum;
    const route = routes.find(r => r.id === trip.routeId);
    if (!route) return sum;
    return sum + getFareForPickup(route, b.pickupPointId);
  }, 0);
  const activeTrips = trips.length;
  const totalPassengers = mockBookings.length;
  const chartData = getBookingsByDay();
  const recentBookings = [...mockBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const stats = [
    { label: "Bookings Hari Ini", value: todayBookings.length, icon: BookOpen, color: "text-primary" },
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-secondary" },
    { label: "Trip Aktif", value: activeTrips, icon: Bus, color: "text-primary" },
    { label: "Total Penumpang", value: totalPassengers, icon: Users, color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button size="sm" onClick={() => navigate("/admin/trips")}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Trip
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/admin/bookings")}>
          <ArrowRight className="h-4 w-4 mr-1" /> Semua Booking
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Penumpang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="text-sm">{b.passengerName}</TableCell>
                    <TableCell>
                      <Badge variant={b.paymentStatus === "paid" ? "default" : "secondary"}>
                        {b.paymentStatus === "paid" ? "Lunas" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
