import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { getRevenueByRoute, getBookingsByDay, trips, vehicleTypes, getAvailableSeats, mockBookings, routes } from "@/data/mockData";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--destructive))",
  "hsl(var(--shuttle-warning))",
];

export default function AdminAnalytics() {
  const revenueData = getRevenueByRoute();
  const bookingData = getBookingsByDay();

  // Occupancy by vehicle type
  const occupancyData = vehicleTypes.map((vt) => {
    const vtTrips = trips.filter((t) => t.vehicleTypeId === vt.id);
    const totalSeats = vtTrips.reduce((s, t) => s + t.seats.length, 0);
    const bookedSeats = vtTrips.reduce((s, t) => s + t.seats.length - getAvailableSeats(t), 0);
    return { name: vt.name, value: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0 };
  });

  // Top pickup points
  const pickupCounts: Record<string, number> = {};
  mockBookings.forEach((b) => {
    pickupCounts[b.pickupPointId] = (pickupCounts[b.pickupPointId] || 0) + 1;
  });
  const topPickups = Object.entries(pickupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const point = routes.flatMap((r) => r.pickupPoints).find((p) => p.id === id);
      return { name: point?.label ?? id, count };
    });

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Route */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue per Rute</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[220px] w-full">
              <BarChart data={revenueData}>
                <XAxis dataKey="route" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bookings by Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking per Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--secondary))" } }} className="h-[220px] w-full">
              <LineChart data={bookingData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} dot={{ fill: "var(--color-bookings)" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Occupancy Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Okupansi per Kendaraan</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: "Okupansi %" } }} className="h-[220px] w-full">
              <PieChart>
                <Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                  {occupancyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Pickup Points */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Titik Jemput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPickups.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm">{p.name}</p>
                    <div className="h-2 rounded-full bg-muted mt-1">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(p.count / topPickups[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{p.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
