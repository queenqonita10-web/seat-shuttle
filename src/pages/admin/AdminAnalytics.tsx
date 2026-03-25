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
  UserCheck,
  Search
} from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const [searchTerm, setSearchTerm] = useState("");
  const bookingData = getBookingsByDay();

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <DollarSign size={80} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Weekly Revenue</p>
                    <p className="text-3xl font-black italic tracking-tighter text-zinc-900">{formatPrice(46100000)}</p>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black border border-green-100">
                    <ArrowUpRight size={12} className="mr-1" /> 12%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Users size={80} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Avg Occupancy</p>
                    <p className="text-3xl font-black italic tracking-tighter text-zinc-900">78.4%</p>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black border border-green-100">
                    <ArrowUpRight size={12} className="mr-1" /> 5.2%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <HistoryIcon size={80} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">No-Show Freq</p>
                    <p className="text-3xl font-black italic tracking-tighter text-red-600">4.2%</p>
                  </div>
                  <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-lg text-[10px] font-black border border-red-100">
                    <ArrowUpRight size={12} className="mr-1" /> 0.8%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={80} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Active Users</p>
                    <p className="text-3xl font-black italic tracking-tighter text-zinc-900">1,242</p>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black border border-green-100">
                    <ArrowUpRight size={12} className="mr-1" /> 24%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-2xl bg-zinc-900 text-white rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight text-primary">Weekly Revenue Trend</CardTitle>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Financial growth analysis</p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#FF6B00', fontWeight: '900' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={6} dot={{ r: 6, fill: "#FF6B00", strokeWidth: 3, stroke: "#18181b" }} activeDot={{ r: 10, fill: "#FF6B00", stroke: "#fff" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl bg-white rounded-3xl">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight text-zinc-900">Occupancy by Rayon</CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vehicle load factor per zone</p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="250">
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {occupancyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-6 mt-4">
                    {occupancyData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">{entry.name}</span>
                        <span className="text-xs font-black text-zinc-900">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/20">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="Cari log audit (User, Modul, atau Detail)..." 
                  className="pl-10 bg-white border-none shadow-inner font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
            <CardHeader className="bg-zinc-900 border-none pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase italic text-white tracking-widest">System Activity Log</CardTitle>
                <Badge className="bg-primary text-white border-none font-black text-[10px] px-3">
                  {filteredLogs.length} ENTRIES
                </Badge>
              </div>
            </CardHeader>
            <Table>
              <TableHeader className="bg-zinc-800">
                <TableRow className="hover:bg-zinc-800 border-none">
                  <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Timestamp</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">User</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-zinc-400">Action</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Module</TableHead>
                  <TableHead className="pr-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  [...filteredLogs].reverse().map((log) => (
                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-zinc-100">
                      <TableCell className="pl-6 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-zinc-900 flex items-center justify-center text-primary shadow-lg">
                            <UserCheck size={14} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight text-zinc-900">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 shadow-sm",
                          log.action === "CREATE" ? "bg-green-500" : log.action === "UPDATE" ? "bg-blue-500" : "bg-red-500"
                        )}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-[10px] uppercase tracking-widest text-zinc-500">{log.module}</TableCell>
                      <TableCell className="pr-6 text-xs font-bold italic text-zinc-600">{log.details}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <HistoryIcon size={48} className="mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-xs italic">No matching activity logs found.</p>
                      </div>
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
