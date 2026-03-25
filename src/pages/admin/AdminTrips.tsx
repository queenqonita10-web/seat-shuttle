import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { trips, routes, vehicleTypes, getVehicleType, getAvailableSeats } from "@/data/mockData";

export default function AdminTrips() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{trips.length} trip terdaftar</p>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Trip
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rute</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead className="hidden md:table-cell">Kendaraan</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead className="hidden md:table-cell">Okupansi</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => {
                const route = routes.find((r) => r.id === trip.routeId);
                const vt = getVehicleType(trip.vehicleTypeId);
                const available = getAvailableSeats(trip);
                const total = trip.seats.length;
                const booked = total - available;
                const pct = Math.round((booked / total) * 100);

                return (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{route?.name}</span>
                        <span className="block text-xs text-muted-foreground">{route?.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{trip.departureTime}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{vt.name}</TableCell>
                    <TableCell>
                      <Badge variant={available === 0 ? "destructive" : "outline"}>
                        {booked}/{total}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Trip Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Trip Baru</DialogTitle>
            <DialogDescription>Isi detail trip yang akan ditambahkan</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Rute</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} — {r.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Jam Keberangkatan</Label>
              <Input type="time" />
            </div>
            <div className="grid gap-2">
              <Label>Jenis Kendaraan</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Simpan Trip</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
