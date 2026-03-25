import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  routes as initialRoutes, 
  formatPrice, 
  addAuditLog,
  Route
} from "@/data/mockData";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Download,
  MoreVertical,
  Route as RouteIcon,
  ChevronRight,
  Map,
  ArrowRight,
  GripVertical
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminRoutes() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "manage-stops">("list");
  
  // Form State
  const [formData, setFormData] = useState({
    routeCode: "",
    name: "",
    origin: "",
    destination: "",
    distance: 0,
    estimatedTime: "",
    status: "active" as "active" | "inactive"
  });

  const selectedRouteDetails = useMemo(() => {
    return routes.find(r => r.id === selectedRoute?.id) || selectedRoute;
  }, [routes, selectedRoute]);

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      if (r.isDeleted) return false;
      const matchesSearch = 
        r.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchTerm, filterStatus]);

  // CRUD Handlers
  const handleCreateRoute = () => {
    // Validation
    if (routes.some(r => r.routeCode === formData.routeCode)) {
      toast.error("Kode rute sudah terdaftar!");
      return;
    }

    const newRoute: Route = {
      ...formData,
      id: `route-${Date.now()}`,
      pickupPoints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoutes([...routes, newRoute]);
    addAuditLog({
      userId: "admin-1",
      action: "CREATE",
      module: "ROUTE",
      details: `Membuat rute baru: ${newRoute.routeCode}`
    });
    
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("Rute berhasil didaftarkan");
  };

  const handleUpdateRoute = () => {
    if (!selectedRoute) return;

    // Duplicate Code Validation (excluding current)
    if (routes.some(r => r.routeCode === formData.routeCode && r.id !== selectedRoute.id)) {
      toast.error("Kode rute sudah terdaftar!");
      return;
    }

    const updatedRoutes = routes.map(r => 
      r.id === selectedRoute.id 
        ? { ...r, ...formData, updatedAt: new Date().toISOString() } 
        : r
    );

    setRoutes(updatedRoutes);
    addAuditLog({
      userId: "admin-1",
      action: "UPDATE",
      module: "ROUTE",
      details: `Memperbarui rute: ${selectedRoute.routeCode}`
    });

    setIsEditDialogOpen(false);
    setSelectedRoute(null);
    toast.success("Informasi rute berhasil diperbarui");
  };

  const handleDeleteRoute = () => {
    if (!selectedRoute) return;

    const updatedRoutes = routes.map(r => 
      r.id === selectedRoute.id ? { ...r, isDeleted: true } : r
    );

    setRoutes(updatedRoutes);
    addAuditLog({
      userId: "admin-1",
      action: "DELETE",
      module: "ROUTE",
      details: `Menghapus rute: ${selectedRoute.routeCode}`
    });

    setIsDeleteDialogOpen(false);
    setSelectedRoute(null);
    toast.success("Rute berhasil dihapus (Soft Delete)");
  };

  const resetForm = () => {
    setFormData({
      routeCode: "",
      name: "",
      origin: "",
      destination: "",
      distance: 0,
      estimatedTime: "",
      status: "active"
    });
  };

  const openEditDialog = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      routeCode: route.routeCode,
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimatedTime: route.estimatedTime,
      status: route.status
    });
    setIsEditDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Code,Name,Origin,Destination,Distance,Time,Status\n"
      + filteredRoutes.map(r => `${r.routeCode},${r.name},${r.origin},${r.destination},${r.distance},${r.estimatedTime},${r.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `routes_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data rute berhasil diekspor ke CSV");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
      {viewMode === "list" ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">Route Management</h2>
              <p className="text-sm text-muted-foreground mt-1">Kelola rute, rayon, dan urutan titik jemput armada PYU-GO</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="font-bold border-2" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" /> Tambah Rute
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase italic">Registrasi Rute Baru</DialogTitle>
                    <DialogDescription>Masukkan detail rute operasional PYU-GO.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-xs font-black uppercase">Kode Rute</Label>
                        <Input id="code" placeholder="RT-A" value={formData.routeCode} onChange={e => setFormData({...formData, routeCode: e.target.value})} className="font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase">Nama Rute (Rayon)</Label>
                        <Input id="name" placeholder="Rayon A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origin" className="text-xs font-black uppercase">Asal</Label>
                        <Input id="origin" placeholder="Terminal Utama" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="text-xs font-black uppercase">Tujuan</Label>
                        <Input id="destination" placeholder="Kota Barat" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="distance" className="text-xs font-black uppercase">Jarak (KM)</Label>
                        <Input id="distance" type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-xs font-black uppercase">Estimasi Waktu</Label>
                        <Input id="time" placeholder="1h 30m" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase">Status Operasional</Label>
                      <Select value={formData.status} onValueChange={(val: "active" | "inactive") => setFormData({...formData, status: val})}>
                        <SelectTrigger className="font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active" className="font-bold">AKTIF</SelectItem>
                          <SelectItem value="inactive" className="font-bold text-muted-foreground">NON-AKTIF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
                    <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="font-bold">BATAL</Button>
                    <Button onClick={handleCreateRoute} className="font-black">SIMPAN RUTE</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters & Search */}
          <Card className="border-none shadow-sm bg-muted/20">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari rute, asal, atau tujuan..." 
                  className="pl-10 bg-white border-none shadow-inner font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-white border-none shadow-sm font-bold uppercase text-xs">
                    <Filter className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold uppercase text-xs">SEMUA STATUS</SelectItem>
                    <SelectItem value="active" className="font-bold uppercase text-xs">AKTIF</SelectItem>
                    <SelectItem value="inactive" className="font-bold uppercase text-xs">NON-AKTIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Routes Table */}
          <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow className="hover:bg-zinc-900 border-none">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest pl-6 text-zinc-400">Kode</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Rayon / Rute</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Asal → Tujuan</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Jarak & Waktu</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-zinc-400">Status</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest pr-6 text-right text-zinc-400">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <TableRow key={route.id} className="group hover:bg-primary/5 transition-colors border-zinc-100">
                      <TableCell className="pl-6">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-xs px-3">
                          {route.routeCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-black text-zinc-900 uppercase italic">{route.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                          {route.pickupPoints.length} Titik Jemput
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-black text-sm text-zinc-700">
                          <span>{route.origin}</span>
                          <ChevronRight size={14} className="text-primary animate-pulse" />
                          <span>{route.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-black text-zinc-900">{route.distance} KM</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{route.estimatedTime}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm",
                          route.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-zinc-400"
                        )}>
                          {route.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => {
                              setSelectedRoute(route);
                              setViewMode("manage-stops");
                            }}
                          >
                            Manage Stops
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-primary" onClick={() => openEditDialog(route)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedRoute(route);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Map size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">Tidak ada rute yang ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className="h-10 w-10 rounded-full">
                <ChevronRight size={24} className="rotate-180" />
              </Button>
              <div>
                <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">Manage Stops</h2>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  {selectedRouteDetails?.routeCode} — {selectedRouteDetails?.name}
                </p>
              </div>
            </div>
            <Button className="font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <Plus size={16} className="mr-2" /> Add Stop Point
            </Button>
          </div>

          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-zinc-900 text-white">
            <CardHeader className="border-b border-white/10 pb-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)]">
                  <MapPin size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl font-black italic uppercase tracking-tighter">{selectedRouteDetails?.origin}</span>
                    <ArrowRight className="text-primary" size={24} strokeWidth={3} />
                    <span className="text-4xl font-black italic uppercase tracking-tighter">{selectedRouteDetails?.destination}</span>
                  </div>
                  <div className="flex gap-4">
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-none font-bold">
                      {selectedRouteDetails?.distance} KM
                    </Badge>
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-none font-bold">
                      {selectedRouteDetails?.estimatedTime}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 bg-zinc-800/50">
                <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide">
                  {selectedRouteDetails?.pickupPoints.map((point, idx) => (
                    <div key={point.id} className="flex items-center shrink-0">
                      <div className="bg-zinc-900 border-2 border-primary/40 rounded-3xl p-6 shadow-2xl hover:border-primary transition-all cursor-pointer group relative min-w-[160px]">
                        <div className="absolute -top-3 -left-3 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                          {idx + 1}
                        </div>
                        <p className="font-black text-primary text-[10px] uppercase tracking-widest mb-1">{point.id}</p>
                        <p className="font-black text-lg uppercase leading-none">{point.label.split(' - ')[1] || point.label}</p>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase">+{point.timeOffset}m</p>
                          <p className="text-xs font-black text-green-500">{formatPrice(point.fare)}</p>
                        </div>
                      </div>
                      {idx < (selectedRouteDetails?.pickupPoints.length || 0) - 1 && (
                        <div className="px-3">
                          <div className="h-1 w-8 bg-zinc-700 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Table>
                <TableHeader className="bg-zinc-900 border-b border-white/5">
                  <TableRow className="hover:bg-zinc-900 border-none">
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-500 pl-6">Code</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-500">Stop Name</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-500 text-center">Offset</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-500 text-right">Fare</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-500 pr-8 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRouteDetails?.pickupPoints.map((point) => (
                    <TableRow key={point.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="text-center cursor-grab active:cursor-grabbing">
                        <GripVertical size={18} className="text-zinc-700 group-hover:text-primary transition-colors mx-auto" />
                      </TableCell>
                      <TableCell className="pl-6 font-black text-primary text-sm">{point.id}</TableCell>
                      <TableCell className="font-black uppercase text-sm">{point.label.split(' - ')[1] || point.label}</TableCell>
                      <TableCell className="text-center font-bold text-zinc-400 text-xs">+{point.timeOffset} Mins</TableCell>
                      <TableCell className="text-right font-black text-green-400">{formatPrice(point.fare)}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/10">
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-500/10">
                            <Trash2 size={16} />
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
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic">Edit Informasi Rute</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-xs font-black uppercase">Kode Rute</Label>
                <Input id="edit-code" value={formData.routeCode} onChange={e => setFormData({...formData, routeCode: e.target.value})} className="font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-black uppercase">Nama Rute</Label>
                <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-origin" className="text-xs font-black uppercase">Asal</Label>
                <Input id="edit-origin" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination" className="text-xs font-black uppercase">Tujuan</Label>
                <Input id="edit-destination" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-distance" className="text-xs font-black uppercase">Jarak (KM)</Label>
                <Input id="edit-distance" type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-xs font-black uppercase">Estimasi Waktu</Label>
                <Input id="edit-time" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase">Status</Label>
              <Select value={formData.status} onValueChange={(val: "active" | "inactive") => setFormData({...formData, status: val})}>
                <SelectTrigger className="font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="font-bold">AKTIF</SelectItem>
                  <SelectItem value="inactive" className="font-bold">NON-AKTIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold uppercase tracking-widest text-xs">BATAL</Button>
            <Button onClick={handleUpdateRoute} className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">SIMPAN PERUBAHAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <DialogTitle className="text-xl font-black uppercase italic">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="font-medium text-zinc-600">
              Apakah Anda yakin ingin menghapus rute <span className="font-black text-zinc-900">{selectedRoute?.routeCode}</span>? 
              Data akan dinonaktifkan dari operasional aktif.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="font-bold uppercase text-xs tracking-widest">BATAL</Button>
            <Button variant="destructive" onClick={handleDeleteRoute} className="font-black uppercase text-xs tracking-widest">HAPUS RUTE</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
