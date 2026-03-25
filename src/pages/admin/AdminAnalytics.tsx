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
  Filter,
  ShieldCheck,
  History as HistoryIcon,
  UserCheck
} from "lucide-react";
import { getBookingsByDay, formatPrice, auditLogs } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic">Reports & Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed performance metrics and system activity</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
            <ShieldCheck size={12} className="mr-1.5" /> Super Admin Access
          </Badge>
          <Button variant="outline" className="font-bold">
            <Filter className="h-4 w-4 mr-2" /> Custom Range
          </Button>
          <Button className="font-bold">
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="analytics" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6">
            <TrendingUp size={14} className="mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6">
            <HistoryIcon size={14} className="mr-2" /> Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ... (Keep existing KPI cards) */}
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
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-bold">System Activity Log</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">User</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Action</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Module</TableHead>
                  <TableHead className="pr-6 font-black uppercase text-[10px] tracking-widest">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length > 0 ? (
                  [...auditLogs].reverse().map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6 text-xs text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <UserCheck size={12} />
                          </div>
                          <span className="text-sm font-bold">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-black text-[10px] uppercase tracking-widest px-2",
                          log.action === "CREATE" ? "bg-green-500" : log.action === "UPDATE" ? "bg-blue-500" : "bg-red-500"
                        )}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-xs">{log.module}</TableCell>
                      <TableCell className="pr-6 text-sm italic text-muted-foreground">{log.details}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No system activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
