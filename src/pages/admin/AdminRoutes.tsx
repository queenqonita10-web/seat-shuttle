import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminRoutes } from '@/hooks/admin/useAdminRoutes';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoutes = () => {
  const { data: routes = [], isLoading } = useAdminRoutes();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    return variants[status] || variants.inactive;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Routes</h1>
        <p className="text-muted-foreground">Manage shuttle routes</p>
      </div>

      <Button className="mb-4">Add New Route</Button>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>{routes.length} routes in system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Pickup Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.route_code}</TableCell>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.origin}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.distance} km</TableCell>
                    <TableCell>{route.estimated_time}</TableCell>
                    <TableCell>{route.pickup_points?.length ?? 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(route.status)}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoutes;
