import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Armchair, 
  Users, 
  Luggage, 
  Eraser, 
  Save, 
  Plus, 
  Trash2, 
  Settings2,
  Undo2,
  Copy,
  ChevronLeft,
  LayoutTemplate,
  Info
} from "lucide-react";
import { 
  SeatLayoutCell, 
  SeatLayoutCellType, 
  SeatLayoutTemplate,
  seatLayoutTemplates as initialTemplates,
  addAuditLog
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PALETTE: { type: SeatLayoutCellType; label: string; icon: any; color: string }[] = [
  { type: "seat-regular", label: "Regular", icon: Armchair, color: "bg-white text-zinc-900 border-zinc-200" },
  { type: "seat-premium", label: "Premium", icon: Armchair, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { type: "seat-vip", label: "VIP", icon: Armchair, color: "bg-amber-50 text-amber-600 border-amber-200" },
  { type: "driver", label: "Driver", icon: Users, color: "bg-zinc-900 text-white border-zinc-800" },
  { type: "baggage", label: "Baggage", icon: Luggage, color: "bg-zinc-100 text-zinc-400 border-zinc-200" },
  { type: "empty", label: "Path/Empty", icon: Eraser, color: "bg-transparent text-zinc-300 border-dashed border-zinc-200" },
];

export default function AdminLayoutDesigner() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SeatLayoutTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [name, setName] = useState("New Layout Template");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(3);
  const [layout, setLayout] = useState<SeatLayoutCell[][]>([]);
  const [selectedTool, setSelectedTool] = useState<SeatLayoutCellType>("seat-regular");
  const [isDragging, setIsDragging] = useState(false);

  // Initialize layout based on rows/cols
  useEffect(() => {
    if (layout.length === 0 || layout.length !== rows || layout[0].length !== cols) {
      const newLayout: SeatLayoutCell[][] = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => ({ type: "empty" }))
      );
      setLayout(newLayout);
    }
  }, [rows, cols]);

  // Handle cell click/drag
  const applyTool = (r: number, c: number) => {
    const newLayout = [...layout.map(row => [...row])];
    newLayout[r][c] = { type: selectedTool };
    
    // Auto-number seats
    let seatCount = 1;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newLayout[i][j].type.startsWith("seat-")) {
          newLayout[i][j].seatNumber = String(seatCount++);
        } else {
          delete newLayout[i][j].seatNumber;
        }
      }
    }
    
    setLayout(newLayout);
  };

  const handleMouseDown = (r: number, c: number) => {
    setIsDragging(true);
    applyTool(r, c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isDragging) {
      applyTool(r, c);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // Basic validation: ensure at least one seat exists
    const seatCount = layout.flat().filter(c => c.type.startsWith("seat-")).length;
    if (seatCount === 0) {
      toast.error("Layout harus memiliki setidaknya satu kursi!");
      return;
    }

    // Check if this template is currently assigned to any vehicles
    // In a real app, we would query the database. Here we check mockData.
    // If updating an existing template that's already in use, show warning.
    if (selectedTemplateId) {
      toast.warning("Peringatan: Perubahan pada template yang sudah aktif dapat mempengaruhi pemesanan yang ada.");
    }

    const newTemplate: SeatLayoutTemplate = {
      id: selectedTemplateId || `template-${Date.now()}`,
      name,
      rows,
      cols,
      layout,
      createdAt: new Date().toISOString(),
    };

    if (selectedTemplateId) {
      setTemplates(templates.map(t => t.id === selectedTemplateId ? newTemplate : t));
      toast.success("Template layout berhasil diperbarui");
    } else {
      setTemplates([...templates, newTemplate]);
      setSelectedTemplateId(newTemplate.id);
      toast.success("Template layout baru berhasil disimpan");
    }

    addAuditLog({
      userId: "admin-1",
      action: selectedTemplateId ? "UPDATE" : "CREATE",
      module: "VEHICLE",
      details: `${selectedTemplateId ? 'Memperbarui' : 'Membuat'} template seat layout: ${name}`
    });
  };

  const loadTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplateId(template.id);
      setName(template.name);
      setRows(template.rows);
      setCols(template.cols);
      setLayout(template.layout);
      toast.info(`Memuat template: ${template.name}`);
    }
  };

  const clearLayout = () => {
    const newLayout = layout.map(row => row.map(() => ({ type: "empty" as SeatLayoutCellType })));
    setLayout(newLayout);
    toast.info("Layout dibersihkan");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6" onMouseUp={handleMouseUp}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/vehicles")} className="h-10 w-10 rounded-full">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">Layout Designer</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Kustomisasi tata letak kursi armada PYU-GO</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="font-bold border-2" onClick={clearLayout}>
            <Eraser className="h-4 w-4 mr-2" /> Clear
          </Button>
          <Button className="font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Template
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-900 text-white">
              <div className="flex items-center gap-3">
                <Settings2 className="text-primary" size={20} />
                <CardTitle className="text-lg font-black uppercase italic tracking-widest">Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest">Layout Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="font-bold italic" placeholder="Standard Hiace..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest">Grid Rows</Label>
                  <Input type="number" value={rows} onChange={e => setRows(Math.max(1, Number(e.target.value)))} className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest">Grid Columns</Label>
                  <Input type="number" value={cols} onChange={e => setCols(Math.max(1, Number(e.target.value)))} className="font-bold" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-xs font-black uppercase tracking-widest block mb-4">Saved Templates</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => loadTemplate(t.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                        selectedTemplateId === t.id 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-white border-zinc-100 hover:border-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutTemplate size={16} />
                        <div>
                          <p className="text-xs font-black uppercase italic leading-none">{t.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">{t.rows}x{t.cols} Grid</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-amber-50 border-amber-100">
            <CardContent className="p-6 flex gap-4">
              <Info className="text-amber-500 shrink-0" size={24} />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase italic text-amber-900">Designer Tip</p>
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                  Klik dan geser (drag) pada grid untuk menggambar layout dengan cepat. Kursi akan diberi nomor secara otomatis dari depan ke belakang.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Grid Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
            <CardHeader className="bg-zinc-900 text-white flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Interactive Canvas</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase">
                  {layout.flat().filter(c => c.type.startsWith("seat-")).length} Seats
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center bg-zinc-50/50">
              {/* Toolbar / Palette */}
              <div className="flex flex-wrap justify-center gap-2 mb-12 p-2 bg-white rounded-2xl shadow-xl border border-zinc-100">
                {PALETTE.map((tool) => (
                  <button
                    key={tool.type}
                    onClick={() => setSelectedTool(tool.type)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-tighter",
                      selectedTool === tool.type 
                        ? "border-primary bg-primary/5 shadow-inner scale-95" 
                        : "border-transparent hover:bg-zinc-50"
                    )}
                  >
                    <tool.icon size={14} className={selectedTool === tool.type ? "text-primary" : "text-zinc-400"} />
                    {tool.label}
                  </button>
                ))}
              </div>

              {/* Designer Grid */}
              <div className="relative p-12 bg-white rounded-[3rem] shadow-2xl border-8 border-zinc-100 min-w-[300px]">
                {/* Front Indicator */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.4em] italic shadow-lg z-20">
                  ▲ Front of Vehicle
                </div>

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {layout.map((row, rIdx) => 
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                        onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                        className={cn(
                          "h-14 w-14 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-crosshair select-none relative group",
                          PALETTE.find(p => p.type === cell.type)?.color,
                          selectedTool === cell.type && "ring-2 ring-primary ring-offset-2 ring-opacity-50"
                        )}
                      >
                        {cell.type !== "empty" && (
                          <>
                            {cell.type === "driver" ? <Users size={20} /> :
                             cell.type === "baggage" ? <Luggage size={20} /> :
                             <Armchair size={20} />}
                            {cell.seatNumber && (
                              <span className="text-[8px] font-black mt-1">#{cell.seatNumber}</span>
                            )}
                          </>
                        )}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    ))
                  )}
                </div>

                {/* Rear Indicator */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-zinc-200 text-zinc-500 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.4em] italic z-20">
                  ▼ Rear of Vehicle
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
