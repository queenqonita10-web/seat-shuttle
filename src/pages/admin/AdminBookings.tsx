import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { mockBookings, routes, trips, formatPrice, getFareForPickup } from "@/data/mockData";
import type { Booking } from "@/data/mockData";

export default function AdminBookings() {
  const [routeFilter, setRouteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);

  const filtered = mockBookings.filter((b) => {
    const trip = trips.find((t) => t.id === b.tripId);
    if (routeFilter !== "all" && trip?.routeId !== routeFilter) return false;
    if (statusFilter !== "all" && b.paymentStatus !== statusFilter) return false;
    return true;
  });

  const getBookingDetails = (b: Booking) => {
    const trip = trips.find((t) => t.id === b.tripId);
    const route = trip ? routes.find((r) => r.id === trip.routeId) : null;
    const pickup = route?.pickupPoints.find((p) => p.id === b.pickupPointId);
    const fare = route ? getFareForPickup(route, b.pickupPointId) : 0;
    return { trip, route, pickup, fare };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={routeFilter} onValueChange={setRouteFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Rute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Rute</SelectItem>
            {routes.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} booking</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Penumpang</TableHead>
                <TableHead className="hidden md:table-cell">Rute</TableHead>
                <TableHead className="hidden md:table-cell">Seat</TableHead>
                <TableHead className="hidden lg:table-cell">Pickup</TableHead>
                <TableHead>Tarif</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const { route, pickup, fare } = getBookingDetails(b);
                return (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelected(b)}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>{b.passengerName}</TableCell>
                    <TableCell className="hidden md:table-cell">{route?.name ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{b.seatNumber}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{pickup?.label ?? "-"}</TableCell>
                    <TableCell className="text-sm">{formatPrice(fare)}</TableCell>
                    <TableCell>
                      <Badge variant={b.paymentStatus === "paid" ? "default" : "secondary"}>
                        {b.paymentStatus === "paid" ? "Lunas" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (() => {
          const { trip, route, pickup, fare } = getBookingDetails(selected);
          return (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detail Booking {selected.id}</DialogTitle>
                <DialogDescription>Informasi lengkap booking</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Penumpang</span><span className="font-medium">{selected.passengerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rute</span><span>{route?.name} → {route?.destination}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Keberangkatan</span><span>{trip?.departureTime}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seat</span><span>{selected.seatNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span>{pickup?.label}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tarif</span><span className="font-semibold">{formatPrice(fare)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pembayaran</span><span>{selected.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <Badge variant={selected.paymentStatus === "paid" ? "default" : "secondary"}>
                    {selected.paymentStatus === "paid" ? "Lunas" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tanggal</span><span>{new Date(selected.createdAt).toLocaleDateString("id-ID")}</span></div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
