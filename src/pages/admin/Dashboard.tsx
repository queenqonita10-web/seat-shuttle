import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { 
  BookOpen, 
  Bus, 
  Users, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  Activity, 
  AlertCircle,
  TrendingUp,
  UserX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  mockBookings, 
  getBookingsByDay, 
  trips, 
  routes, 
  formatPrice, 
  getFareForPickup,
  drivers
} from "@/data/mockData";
import { cn } from "@/lib/utils";

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
    return sum + (getFareForPickup(route, b.pickupPointId) || 0);
  }, 0);

  const activeTrips = trips.filter(t => t.status === "active");
  const totalPassengers = mockBookings.length;
  const chartData = getBookingsByDay();
  const recentBookings = [...mockBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  const noShowCount = mockBookings.filter(b => b.status === "no_show").length;
  const noShowRate = Math.round((noShowCount / (totalPassengers || 1)) * 100);

  const stats = [
    { label: "Bookings Today", value: todayBookings.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Trips", value: activeTrips.length, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "No-Show Rate", value: `${noShowRate}%`, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
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
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
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
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#888', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#888', fontSize: 12 }} 
                    />
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
                    <Bar 
                      dataKey="bookings" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Table */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/bookings")}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-wider">Passenger</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider">Route</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider">Payment</TableHead>
                    <TableHead className="pr-6 text-right uppercase text-[10px] font-bold tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => {
                    const trip = trips.find(t => t.id === booking.tripId);
                    const route = trip ? routes.find(r => r.id === trip.routeId) : null;
                    return (
                      <TableRow key={booking.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="pl-6">
                          <div>
                            <p className="font-bold text-sm">{booking.passengerName}</p>
                            <p className="text-xs text-muted-foreground">{booking.passengerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-muted/50 border-none">
                            {route?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "h-2 w-2 rounded-full p-0",
                              booking.paymentStatus === "paid" ? "bg-green-500" : "bg-yellow-500"
                            )} />
                            <span className="text-xs font-medium uppercase">{booking.paymentStatus}</span>
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel: Real-time & Driver Status */}
        <div className="space-y-8">
          {/* Active Trips Card */}
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Live Operations</CardTitle>
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTrips.length > 0 ? (
                activeTrips.slice(0, 3).map((trip) => {
                  const route = routes.find(r => r.id === trip.routeId);
                  const driver = drivers.find(d => d.id === trip.driverId);
                  return (
                    <div key={trip.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm">{route?.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{trip.departureTime}</p>
                      </div>
                      <p className="text-xs opacity-80 mb-3">Driver: {driver?.name || "Unassigned"}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-1/3" /> {/* mock progress */}
                        </div>
                        <span className="text-[10px] font-bold">Stop 4/12</span>
                      </div>
                    </div>
                  );
                })
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

          {/* Driver Status Card */}
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

          {/* Alerts Card */}
          <Card className="border-none shadow-sm border-l-4 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Operations Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs font-bold text-red-700">Low Seats Warning</p>
                <p className="text-[10px] text-red-600 mt-0.5">Trip #TR-942 (Rayon A) is 90% full for tomorrow.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-700">Driver Delay</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Driver Agus is 12 mins behind schedule on Trip #TR-102.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
