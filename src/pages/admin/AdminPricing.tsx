import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { routes, formatPrice } from "@/data/mockData";
import { DollarSign, Edit2, TrendingUp, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPricing() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" /> Dynamic Pricing
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold">Pricing Policy</p>
          <p>Prices are set per pickup point relative to the route destination. All fares include service tax and insurance.</p>
        </div>
      </div>

      <Tabs defaultValue={routes[0]?.id}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          {routes.map((route) => (
            <TabsTrigger key={route.id} value={route.id} className="rounded-md">
              {route.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {routes.map((route) => (
          <TabsContent key={route.id} value={route.id} className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">{route.name} Pricing</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Destination: {route.destination}</p>
                </div>
                <Button size="sm">
                  <Edit2 className="h-3 w-3 mr-2" /> Edit All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stop Code</TableHead>
                      <TableHead>Pickup Point</TableHead>
                      <TableHead>Distance Offset</TableHead>
                      <TableHead className="text-right">Fare (IDR)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {route.pickupPoints.map((point) => (
                      <TableRow key={point.id}>
                        <TableCell className="font-bold text-primary">{point.id}</TableCell>
                        <TableCell>{point.label.split(" - ")[1] || point.label}</TableCell>
                        <TableCell className="text-muted-foreground">{point.timeOffset}m</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(point.fare || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
