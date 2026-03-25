import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { routes, pickupPoints, formatPrice } from "@/data/mockData";
import { 
  MapPin, 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2, 
  ArrowRight,
  Route as RouteIcon,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminRoutes() {
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id);
  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Route & Pickup Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure Rayon zones and pickup sequence</p>
        </div>
        <Button className="font-bold">
          <Plus className="h-4 w-4 mr-2" /> Create New Route
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Route Selector Sidebar */}
        <Card className="lg:col-span-3 border-none shadow-sm h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Active Rayons</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left",
                  selectedRouteId === route.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedRouteId === route.id ? "bg-white/20" : "bg-primary/10 text-primary"
                  )}>
                    <RouteIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{route.name}</p>
                    <p className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      selectedRouteId === route.id ? "opacity-70" : "text-muted-foreground"
                    )}>
                      {route.pickupPoints.length} Stops
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className={cn(selectedRouteId === route.id ? "opacity-100" : "opacity-0")} />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Visual Route Builder */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{selectedRoute?.name} Sequence</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Destination: <span className="font-bold text-foreground">{selectedRoute?.destination}</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 size={14} className="mr-2" /> Edit Route Info
                </Button>
                <Button size="sm">
                  <Plus size={14} className="mr-2" /> Add Stop
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 bg-muted/20">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {selectedRoute?.pickupPoints.map((point, idx) => (
                    <div key={point.id} className="flex items-center shrink-0">
                      <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm hover:border-primary transition-colors cursor-pointer group relative">
                        <div className="absolute -top-2 -left-2 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </div>
                        <p className="font-black text-primary text-xs mb-1">{point.id}</p>
                        <p className="font-bold text-sm whitespace-nowrap">{point.label.split(' - ')[1] || point.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">+{point.timeOffset} mins</p>
                      </div>
                      {idx < selectedRoute.pickupPoints.length - 1 && (
                        <div className="px-2">
                          <ArrowRight size={16} className="text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="pl-6 uppercase text-[10px] font-black tracking-widest">Code</TableHead>
                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Pickup Point Name</TableHead>
                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Time Offset</TableHead>
                    <TableHead className="text-right uppercase text-[10px] font-black tracking-widest">Base Fare</TableHead>
                    <TableHead className="pr-6 text-right uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRoute?.pickupPoints.map((point) => (
                    <TableRow key={point.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </TableCell>
                      <TableCell className="pl-6 font-black text-primary">{point.id}</TableCell>
                      <TableCell className="font-bold">{point.label.split(' - ')[1] || point.label}</TableCell>
                      <TableCell className="text-muted-foreground">+{point.timeOffset} mins</TableCell>
                      <TableCell className="text-right font-bold">{formatPrice(point.fare || 0)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
