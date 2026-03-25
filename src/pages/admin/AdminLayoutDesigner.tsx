import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLayoutDesigner() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Layout Designer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Design Vehicle Layouts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Implementation in progress</p>
        </CardContent>
      </Card>
    </div>
  );
}