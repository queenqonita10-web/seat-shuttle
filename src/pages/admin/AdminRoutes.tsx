import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, MapPin } from "lucide-react";
import { routes, formatPrice } from "@/data/mockData";

export default function AdminRoutes() {
  const [openRoutes, setOpenRoutes] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpenRoutes((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{routes.length} rute aktif</p>

      {routes.map((route) => (
        <Card key={route.id}>
          <Collapsible open={openRoutes.includes(route.id)} onOpenChange={() => toggle(route.id)}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">{route.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{route.destination} · {route.pickupPoints.length} titik jemput</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openRoutes.includes(route.id) ? "rotate-180" : ""}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0 pb-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Urutan</TableHead>
                      <TableHead>Titik Jemput</TableHead>
                      <TableHead>Offset (min)</TableHead>
                      <TableHead>Tarif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {route.pickupPoints.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Badge variant="outline">{p.order}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{p.label}</TableCell>
                        <TableCell className="text-sm">+{p.timeOffset} min</TableCell>
                        <TableCell className="text-sm font-medium">{formatPrice(p.fare)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}
