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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic">Route Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola rute, rayon, dan urutan titik jemput</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="font-bold" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Tambah Rute
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrasi Rute Baru</DialogTitle>
                <DialogDescription>Masukkan detail rute operasional PYU-GO.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode Rute</Label>
                    <Input id="code" placeholder="RT-A" value={formData.routeCode} onChange={e => setFormData({...formData, routeCode: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Rute (Rayon)</Label>
                    <Input id="name" placeholder="Rayon A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Asal</Label>
                    <Input id="origin" placeholder="Terminal Utama" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Tujuan</Label>
                    <Input id="destination" placeholder="Kota Barat" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Jarak (KM)</Label>
                    <Input id="distance" type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Estimasi Waktu</Label>
                    <Input id="time" placeholder="1h 30m" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val: "active" | "inactive") => setFormData({...formData, status: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Non-Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Batal</Button>
                <Button onClick={handleCreateRoute}>Simpan Rute</Button>
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
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Non-Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-black uppercase text-[10px] tracking-widest pl-6">Kode</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Rayon / Rute</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Asal → Tujuan</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Jarak & Waktu</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest pr-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <TableRow key={route.id} className="group">
                  <TableCell className="pl-6 font-bold text-primary">{route.routeCode}</TableCell>
                  <TableCell>
                    <div className="font-bold">{route.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{route.pickupPoints.length} Titik Jemput</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <span>{route.origin}</span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                      <span>{route.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold">{route.distance} KM</div>
                    <div className="text-xs text-muted-foreground">{route.estimatedTime}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "font-black text-[10px] uppercase tracking-widest px-2",
                      route.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-zinc-500"
                    )}>
                      {route.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(route)}>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Tidak ada rute yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Informasi Rute</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Kode Rute</Label>
                <Input id="edit-code" value={formData.routeCode} onChange={e => setFormData({...formData, routeCode: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Rute</Label>
                <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-origin">Asal</Label>
                <Input id="edit-origin" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination">Tujuan</Label>
                <Input id="edit-destination" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-distance">Jarak (KM)</Label>
                <Input id="edit-distance" type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Estimasi Waktu</Label>
                <Input id="edit-time" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val: "active" | "inactive") => setFormData({...formData, status: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleUpdateRoute}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus rute <span className="font-bold text-foreground">{selectedRoute?.routeCode}</span>? 
              Data ini akan disembunyikan dari sistem namun tetap tersimpan di database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteRoute}>Hapus Rute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
