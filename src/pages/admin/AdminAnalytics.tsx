import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from "lucide-react";
import { getBookingsByDay, formatPrice } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const revenueData = [
  { name: "Mon", revenue: 4500000 },
  { name: "Tue", revenue: 5200000 },
  { name: "Wed", revenue: 4800000 },
  { name: "Thu", revenue: 6100000 },
  { name: "Fri", revenue: 7500000 },
  { name: "Sat", revenue: 9200000 },
  { name: "Sun", revenue: 8800000 },
];

const occupancyData = [
  { name: "Rayon A", value: 85 },
  { name: "Rayon B", value: 72 },
  { name: "Rayon C", value: 64 },
  { name: "Rayon D", value: 91 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminAnalytics() {
  const bookingData = getBookingsByDay();

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed performance metrics and trend analysis</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold">
            <Filter className="h-4 w-4 mr-2" /> Custom Range
          </Button>
          <Button className="font-bold">
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Weekly Revenue</p>
                <p className="text-3xl font-black">{formatPrice(46100000)}</p>
              </div>
              <div className="flex items-center text-green-500 bg-green-50 px-2 py-1 rounded-md text-[10px] font-black">
                <ArrowUpRight size={12} className="mr-1" /> 12%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Avg Occupancy</p>
                <p className="text-3xl font-black">78.4%</p>
              </div>
              <div className="flex items-center text-green-500 bg-green-50 px-2 py-1 rounded-md text-[10px] font-black">
                <ArrowUpRight size={12} className="mr-1" /> 5.2%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">No-Show Freq</p>
                <p className="text-3xl font-black text-red-500">4.2%</p>
              </div>
              <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-md text-[10px] font-black">
                <ArrowUpRight size={12} className="mr-1" /> 0.8%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Active Users</p>
                <p className="text-3xl font-black">1,242</p>
              </div>
              <div className="flex items-center text-green-500 bg-green-50 px-2 py-1 rounded-md text-[10px] font-black">
                <ArrowUpRight size={12} className="mr-1" /> 24%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue Trends (Weekly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Occupancy by Rayon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4 pr-8">
                {occupancyData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <div>
                      <p className="text-xs font-bold">{entry.name}</p>
                      <p className="text-lg font-black">{entry.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
