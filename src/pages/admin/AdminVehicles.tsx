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
  vehicles as initialVehicles, 
  vehicleTypes,
  routes,
  addAuditLog,
  Vehicle
} from "@/data/mockData";
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Download,
  History,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicleTypeId: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    status: "active" as "active" | "maintenance" | "inactive",
    assignedRouteId: ""
  });

  // Plate Validation (B 1234 XYZ)
  const validatePlate = (plate: string) => {
    const regex = /^[A-Z]{1,2}\s\d{1,4}\s[A-Z]{1,3}$/;
    return regex.test(plate.toUpperCase());
  };

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (v.isDeleted) return false;
      const matchesSearch = 
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || v.vehicleTypeId === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [vehicles, searchTerm, filterType]);

  // CRUD Handlers
  const handleCreateVehicle = () => {
    if (!validatePlate(formData.licensePlate)) {
      toast.error("Format plat nomor tidak valid! (Contoh: B 1234 ABC)");
      return;
    }

    if (vehicles.some(v => v.licensePlate.toUpperCase() === formData.licensePlate.toUpperCase())) {
      toast.error("Plat nomor sudah terdaftar di sistem!");
      return;
    }

    const newVehicle: Vehicle = {
      ...formData,
      id: `V-${Date.now()}`,
      licensePlate: formData.licensePlate.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };

    setVehicles([...vehicles, newVehicle]);
    addAuditLog({
      userId: "admin-1",
      action: "CREATE",
      module: "VEHICLE",
      details: `Registrasi kendaraan baru: ${newVehicle.licensePlate}`
    });

    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("Kendaraan berhasil didaftarkan");
  };

  const handleUpdateVehicle = () => {
    if (!selectedVehicle) return;

    if (!validatePlate(formData.licensePlate)) {
      toast.error("Format plat nomor tidak valid!");
      return;
    }

    if (vehicles.some(v => v.licensePlate.toUpperCase() === formData.licensePlate.toUpperCase() && v.id !== selectedVehicle.id)) {
      toast.error("Plat nomor sudah digunakan kendaraan lain!");
      return;
    }

    const newHistory = [...(selectedVehicle.history || [])];
    if (selectedVehicle.licensePlate !== formData.licensePlate.toUpperCase()) {
      newHistory.push({
        field: "licensePlate",
        oldValue: selectedVehicle.licensePlate,
        newValue: formData.licensePlate.toUpperCase(),
        date: new Date().toISOString()
      });
    }

    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id 
        ? { 
            ...v, 
            ...formData, 
            licensePlate: formData.licensePlate.toUpperCase(),
            updatedAt: new Date().toISOString(),
            history: newHistory
          } 
        : v
    );

    setVehicles(updatedVehicles);
    addAuditLog({
      userId: "admin-1",
      action: "UPDATE",
      module: "VEHICLE",
      details: `Update data kendaraan: ${selectedVehicle.licensePlate}`
    });

    setIsEditDialogOpen(false);
    setSelectedVehicle(null);
    toast.success("Data kendaraan berhasil diperbarui");
  };

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;

    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, isDeleted: true } : v
    );

    setVehicles(updatedVehicles);
    addAuditLog({
      userId: "admin-1",
      action: "DELETE",
      module: "VEHICLE",
      details: `Hapus kendaraan: ${selectedVehicle.licensePlate}`
    });

    setIsDeleteDialogOpen(false);
    setSelectedVehicle(null);
    toast.success("Kendaraan berhasil dihapus");
  };

  const resetForm = () => {
    setFormData({
      vehicleTypeId: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      licensePlate: "",
      status: "active",
      assignedRouteId: ""
    });
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleTypeId: vehicle.vehicleTypeId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      assignedRouteId: vehicle.assignedRouteId || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "License Plate,Brand,Model,Year,Color,Status,Assigned Route\n"
      + filteredVehicles.map(v => {
        const route = routes.find(r => r.id === v.assignedRouteId);
        return `${v.licensePlate},${v.brand},${v.model},${v.year},${v.color},${v.status},${route?.routeCode || 'None'}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data armada berhasil diekspor ke CSV");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">Vehicle Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola armada bus dan SUV operasional PYU-GO</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="font-bold" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold">
                <Plus className="h-4 w-4 mr-2" /> Tambah Armada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrasi Armada Baru</DialogTitle>
                <DialogDescription>Masukkan data teknis dan legalitas kendaraan.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Kendaraan</Label>
                    <Select value={formData.vehicleTypeId} onValueChange={val => setFormData({...formData, vehicleTypeId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map(vt => (
                          <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Plat Nomor (Indonesia)</Label>
                    <Input id="plate" placeholder="B 1234 XYZ" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" placeholder="Toyota" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="Hiace Premio" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Tahun</Label>
                    <Input id="year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Warna</Label>
                    <Input id="color" placeholder="Putih" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rute Penugasan</Label>
                    <Select value={formData.assignedRouteId} onValueChange={val => setFormData({...formData, assignedRouteId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih rute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Penugasan</SelectItem>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.routeCode} - {r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Batal</Button>
                <Button onClick={handleCreateVehicle}>Daftarkan Armada</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-muted/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari plat nomor, brand, atau model..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Jenis Kendaraan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              {vehicleTypes.map(vt => (
                <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Plat Nomor</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Kendaraan</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Jenis</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Rute Aktif</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="pr-6 text-right font-black uppercase text-[10px] tracking-widest">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((v) => {
              const vt = vehicleTypes.find(t => t.id === v.vehicleTypeId);
              const route = routes.find(r => r.id === v.assignedRouteId);
              return (
                <TableRow key={v.id} className="group">
                  <TableCell className="pl-6">
                    <div className="bg-zinc-900 text-white px-3 py-1 rounded-md font-mono font-bold text-center border-2 border-zinc-700 shadow-inner w-fit">
                      {v.licensePlate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{v.brand} {v.model}</div>
                    <div className="text-xs text-muted-foreground">{v.color} · {v.year}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                      {vt?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {route ? (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                          {route.routeCode}
                        </Badge>
                        <ChevronRight size={12} className="text-muted-foreground" />
                        <span className="text-xs">{route.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "font-black text-[10px] uppercase tracking-widest px-2",
                      v.status === "active" ? "bg-green-500" : v.status === "maintenance" ? "bg-amber-500" : "bg-zinc-500"
                    )}>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setSelectedVehicle(v);
                        setIsHistoryOpen(true);
                      }}>
                        <History size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(v)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedVehicle(v);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Edit & History & Delete Dialogs (Similar to AdminRoutes) */}
      {/* ... (Implementation logic continues for history tracking display) */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Riwayat Perubahan Plat Nomor</DialogTitle>
            <DialogDescription>Tracking legalitas armada {selectedVehicle?.licensePlate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVehicle?.history?.length ? (
              selectedVehicle.history.map((h, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Perubahan {h.field}</p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="line-through text-muted-foreground">{h.oldValue}</span>
                      <ChevronRight size={12} />
                      <span className="font-bold text-green-600">{h.newValue}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{new Date(h.date).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground italic">Belum ada riwayat perubahan.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Konfirmasi Penghapusan
            </DialogTitle>
            <DialogDescription>
              Menghapus armada <span className="font-bold text-foreground">{selectedVehicle?.licensePlate}</span> akan melepaskan semua penugasan rute terkait.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>Hapus Armada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
