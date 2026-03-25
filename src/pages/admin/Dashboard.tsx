import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { 
  BookOpen, Bus, DollarSign, Plus, ArrowRight, Activity, AlertCircle, UserX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { useAdminBookings } from "@/hooks/admin/useAdminBookings";
import { useAdminTrips } from "@/hooks/admin/useAdminTrips";
import { useAdminDrivers } from "@/hooks/admin/useAdminDrivers";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mock chart data (will be replaced with real aggregation later)
const chartData = [
  { day: "Mon", bookings: 5 },
  { day: "Tue", bookings: 8 },
  { day: "Wed", bookings: 3 },
  { day: "Thu", bookings: 7 },
  { day: "Fri", bookings: 12 },
  { day: "Sat", bookings: 9 },
  { day: "Sun", bookings: 4 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashStats, isLoading: statsLoading } = useAdminDashboard();
  const { data: bookings = [], isLoading: bookingsLoading } = useAdminBookings();
  const { data: trips = [] } = useAdminTrips();
  const { data: drivers = [] } = useAdminDrivers();

  const activeTrips = trips.filter(t => ["active", "ONGOING", "pending"].includes(t.status));
  const recentBookings = [...bookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const stats = [
    { label: "Total Bookings", value: statsLoading ? "..." : dashStats?.totalBookings ?? 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Trips", value: statsLoading ? "..." : dashStats?.activeTrips ?? 0, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Revenue", value: statsLoading ? "..." : formatPrice(dashStats?.totalRevenue ?? 0), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active Drivers", value: statsLoading ? "..." : dashStats?.activeDrivers ?? 0, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", s.bg)}>
                  <s.icon className={cn("h-6 w-6", s.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Booking Trends</CardTitle>
                <p className="text-sm text-muted-foreground">Daily booking volume for the last 7 days</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")}>
                View Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#f8f9fa' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                              <p className="text-xs font-bold text-gray-500 uppercase">{payload[0].payload.day}</p>
                              <p className="text-lg font-bold text-primary">{payload[0].value} Bookings</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/bookings")}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-wider">Passenger</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-wider">Seat</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-wider">Payment</TableHead>
                      <TableHead className="pr-6 text-right uppercase text-[10px] font-bold tracking-wider">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="pl-6">
                          <div>
                            <p className="font-bold text-sm">{booking.passenger_name}</p>
                            <p className="text-xs text-muted-foreground">{booking.passenger_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-muted/50 border-none">
                            {booking.seat_number}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "h-2 w-2 rounded-full p-0",
                              booking.payment_status === "paid" || booking.payment_status === "COMPLETED" ? "bg-green-500" : "bg-yellow-500"
                            )} />
                            <span className="text-xs font-medium uppercase">{booking.payment_status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-black uppercase",
                            booking.status === "picked_up" ? "bg-green-500/10 text-green-600" :
                            booking.status === "no_show" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                          )}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Live Operations</CardTitle>
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTrips.length > 0 ? (
                activeTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm">{trip.routes?.name ?? "—"}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{trip.departure_time}</p>
                    </div>
                    <p className="text-xs opacity-80 mb-3">Driver: {trip.drivers?.name || "Unassigned"}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-1/3" />
                      </div>
                      <span className="text-[10px] font-bold">In Progress</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center opacity-60">
                  <Bus className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No active trips currently</p>
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                onClick={() => navigate("/admin/monitoring")}
              >
                Go to Monitoring <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Driver Status</CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold">{drivers.length} Total</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {drivers.slice(0, 5).map((driver) => (
                <div key={driver.id} className="flex items-center justify-between group cursor-pointer hover:bg-muted/20 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{driver.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{driver.phone}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "h-2 w-2 rounded-full p-0 border-none",
                    driver.status === "on_trip" ? "bg-green-500" :
                    driver.status === "online" ? "bg-blue-500" : "bg-gray-300"
                  )} />
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground" onClick={() => navigate("/admin/drivers")}>
                Manage All Drivers
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border-l-4 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Operations Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs font-bold text-red-700">Low Seats Warning</p>
                <p className="text-[10px] text-red-600 mt-0.5">Some trips are nearing full capacity.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-700">Driver Delay</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Check monitoring for delays.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
