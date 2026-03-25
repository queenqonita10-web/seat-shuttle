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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  seatLayoutTemplates,
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
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicleTypeId: "",
    layoutTemplateId: "",
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
      layoutTemplateId: "",
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
      layoutTemplateId: vehicle.layoutTemplateId || "",
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
          <p className="text-sm text-muted-foreground mt-1 font-medium">Kelola armada bus dan SUV operasional PYU-GO</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="font-bold border-2" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Tambah Armada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic">Registrasi Armada Baru</DialogTitle>
                <DialogDescription>Masukkan data teknis dan legalitas kendaraan.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">Jenis Kendaraan</Label>
                    <Select value={formData.vehicleTypeId} onValueChange={val => setFormData({...formData, vehicleTypeId: val})}>
                      <SelectTrigger className="font-bold">
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map(vt => (
                          <SelectItem key={vt.id} value={vt.id} className="font-bold uppercase text-xs">{vt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate" className="text-xs font-black uppercase">Plat Nomor (Indonesia)</Label>
                    <Input id="plate" placeholder="B 1234 XYZ" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} className="font-mono font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">Seat Layout Template</Label>
                    <Select value={formData.layoutTemplateId} onValueChange={val => setFormData({...formData, layoutTemplateId: val})}>
                      <SelectTrigger className="font-bold italic">
                        <SelectValue placeholder="Pilih template" />
                      </SelectTrigger>
                      <SelectContent>
                        {seatLayoutTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-bold uppercase text-[10px] italic">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-xs font-black uppercase">Brand</Label>
                    <Input id="brand" placeholder="Toyota" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-xs font-black uppercase">Model</Label>
                    <Input id="model" placeholder="Hiace Premio" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-xs font-black uppercase">Tahun</Label>
                    <Input id="year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-xs font-black uppercase">Warna</Label>
                    <Input id="color" placeholder="Putih" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">Rute Penugasan</Label>
                    <Select value={formData.assignedRouteId} onValueChange={val => setFormData({...formData, assignedRouteId: val})}>
                      <SelectTrigger className="font-bold">
                        <SelectValue placeholder="Pilih rute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="font-bold uppercase text-xs">Tanpa Penugasan</SelectItem>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.id} className="font-bold uppercase text-xs">{r.routeCode} - {r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="font-bold uppercase tracking-widest text-xs">BATAL</Button>
                <Button onClick={handleCreateVehicle} className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">DAFTARKAN ARMADA</Button>
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
              className="pl-10 bg-white border-none shadow-inner font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px] bg-white border-none shadow-sm font-bold uppercase text-xs">
              <Filter className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Jenis Kendaraan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold uppercase text-xs">SEMUA JENIS</SelectItem>
              {vehicleTypes.map(vt => (
                <SelectItem key={vt.id} value={vt.id} className="font-bold uppercase text-xs">{vt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="hover:bg-zinc-900 border-none">
              <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Plat Nomor</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Kendaraan</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Jenis</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Rute Aktif</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-zinc-400">Status</TableHead>
              <TableHead className="pr-6 text-right font-black uppercase text-[10px] tracking-widest text-zinc-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((v) => {
              const vt = vehicleTypes.find(t => t.id === v.vehicleTypeId);
              const route = routes.find(r => r.id === v.assignedRouteId);
              return (
                <TableRow key={v.id} className="group hover:bg-primary/5 transition-colors border-zinc-100">
                  <TableCell className="pl-6">
                    <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg font-mono font-black text-center border-2 border-zinc-700 shadow-xl w-fit italic tracking-tighter">
                      {v.licensePlate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-black text-zinc-900 uppercase italic">{v.brand} {v.model}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{v.color} · {v.year}</div>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-2 border-zinc-200 hover:border-primary transition-colors cursor-help">
                          {vt?.name || "Unknown"}
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-4 rounded-2xl shadow-2xl border-none bg-zinc-900">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center border-b border-white/10 pb-2">Seat Layout</p>
                          <div className="mx-auto space-y-1">
                            {vt?.layout.map((row, ri) => (
                              <div key={ri} className="flex justify-center gap-1">
                                {row.map((cell, ci) => (
                                  <div
                                    key={ci}
                                    className={cn(
                                      "h-5 w-5 rounded-md text-[8px] flex items-center justify-center font-black",
                                      cell === "seat" && "bg-primary/20 text-primary border border-primary/40",
                                      cell === "driver" && "bg-white/10 text-white",
                                      cell === "empty" && "bg-transparent",
                                      cell === "baggage" && "bg-zinc-800 text-zinc-500"
                                    )}
                                  >
                                    {cell === "seat" && "S"}
                                    {cell === "driver" && "🚌"}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    {route ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-2">
                          {route.routeCode}
                        </Badge>
                        <ChevronRight size={12} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-tight">{route.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic opacity-50">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm",
                      v.status === "active" ? "bg-green-500" : v.status === "maintenance" ? "bg-amber-500 shadow-amber-500/20" : "bg-zinc-400"
                    )}>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-zinc-100 text-zinc-500" 
                        title="View History"
                        onClick={() => {
                          setSelectedVehicle(v);
                          setIsHistoryOpen(true);
                        }}
                      >
                        <History size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-primary" onClick={() => openEditDialog(v)}>
                        <Edit2 size={16} />
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
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic">Riwayat Legalitas</DialogTitle>
            <DialogDescription className="font-bold text-xs uppercase tracking-widest text-zinc-500">Armada {selectedVehicle?.licensePlate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedVehicle?.history?.length ? (
              selectedVehicle.history.map((h, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-dashed border-zinc-200">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 shadow-inner">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Perubahan {h.field}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="line-through text-zinc-400 font-mono text-sm">{h.oldValue}</span>
                      <ChevronRight size={14} className="text-primary" />
                      <span className="font-black text-green-600 font-mono text-lg tracking-tighter">{h.newValue}</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 mt-3 flex items-center gap-1.5">
                      <Clock size={10} /> {new Date(h.date).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <ShieldCheck size={48} className="text-zinc-200 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Belum ada riwayat perubahan legalitas.</p>
              </div>
            )}
          </div>
          <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
            <Button variant="ghost" onClick={() => setIsHistoryOpen(false)} className="font-black uppercase tracking-widest text-xs w-full">TUTUP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic">Edit Data Armada</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase">Jenis Kendaraan</Label>
                <Select value={formData.vehicleTypeId} onValueChange={val => setFormData({...formData, vehicleTypeId: val})}>
                  <SelectTrigger className="font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(vt => (
                      <SelectItem key={vt.id} value={vt.id} className="font-bold uppercase text-xs">{vt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="edit-plate" className="text-xs font-black uppercase">Plat Nomor</Label>
                  <Input id="edit-plate" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} className="font-mono font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Seat Layout Template</Label>
                  <Select value={formData.layoutTemplateId} onValueChange={val => setFormData({...formData, layoutTemplateId: val})}>
                    <SelectTrigger className="font-bold italic">
                      <SelectValue placeholder="Pilih template" />
                    </SelectTrigger>
                    <SelectContent>
                      {seatLayoutTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id} className="font-bold uppercase text-[10px] italic">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-brand" className="text-xs font-black uppercase">Brand</Label>
                <Input id="edit-brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model" className="text-xs font-black uppercase">Model</Label>
                <Input id="edit-model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year" className="text-xs font-black uppercase">Tahun</Label>
                <Input id="edit-year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color" className="text-xs font-black uppercase">Warna</Label>
                <Input id="edit-color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase">Status Operasional</Label>
                <Select value={formData.status} onValueChange={(val: "active" | "maintenance" | "inactive") => setFormData({...formData, status: val})}>
                  <SelectTrigger className="font-bold uppercase text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="font-bold uppercase text-xs">AKTIF</SelectItem>
                    <SelectItem value="maintenance" className="font-bold uppercase text-xs">MAINTENANCE</SelectItem>
                    <SelectItem value="inactive" className="font-bold uppercase text-xs">NON-AKTIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase">Rute Penugasan</Label>
              <Select value={formData.assignedRouteId} onValueChange={val => setFormData({...formData, assignedRouteId: val})}>
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder="Pilih rute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="font-bold uppercase text-xs text-muted-foreground italic">Lepas Penugasan</SelectItem>
                  {routes.map(r => (
                    <SelectItem key={r.id} value={r.id} className="font-bold uppercase text-xs">{r.routeCode} - {r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold uppercase tracking-widest text-xs">BATAL</Button>
            <Button onClick={handleUpdateVehicle} className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">SIMPAN PERUBAHAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="font-bold text-zinc-600 mt-2">
              Menghapus armada <span className="text-zinc-900 font-black">{selectedVehicle?.licensePlate}</span> akan melepaskan semua penugasan rute terkait.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-8">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="font-black uppercase text-xs tracking-widest">BATAL</Button>
            <Button variant="destructive" onClick={handleDeleteVehicle} className="font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20">HAPUS ARMADA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
