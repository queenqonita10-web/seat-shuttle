import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vehicleTypes } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function AdminVehicles() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{vehicleTypes.length} jenis kendaraan</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleTypes.map((vt) => {
          const seatCount = vt.layout.flat().filter((c) => c === "seat").length;
          return (
            <Card key={vt.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{vt.name}</CardTitle>
                <Badge variant="outline" className="w-fit">{seatCount} seat</Badge>
              </CardHeader>
              <CardContent>
                {/* Mini seat layout */}
                <div className="mx-auto max-w-[160px] rounded-xl border bg-muted/30 p-3 space-y-1.5">
                  {vt.layout.map((row, ri) => {
                    const isBaggage = row.every((c) => c === "baggage");
                    if (isBaggage) {
                      return (
                        <div key={ri} className="rounded bg-muted py-1 text-center text-[8px] text-muted-foreground uppercase">
                          Baggage
                        </div>
                      );
                    }
                    return (
                      <div key={ri} className="flex justify-center gap-1">
                        {row.map((cell, ci) => (
                          <div
                            key={ci}
                            className={cn(
                              "h-6 w-6 rounded text-[8px] flex items-center justify-center",
                              cell === "seat" && "bg-primary/20 text-primary border border-primary/30",
                              cell === "driver" && "bg-muted text-muted-foreground",
                              cell === "empty" && "bg-transparent",
                            )}
                          >
                            {cell === "seat" && "S"}
                            {cell === "driver" && "🚌"}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
