import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSeatMap() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Seat Map</h1>
      <Card>
        <CardHeader>
          <CardTitle>Seat Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Implementation in progress</p>
        </CardContent>
      </Card>
    </div>
  );
}