import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMonitoring() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monitoring</h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Implementation in progress</p>
        </CardContent>
      </Card>
    </div>
  );
}