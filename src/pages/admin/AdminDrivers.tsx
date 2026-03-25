import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDrivers() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Drivers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Implementation in progress</p>
        </CardContent>
      </Card>
    </div>
  );
}