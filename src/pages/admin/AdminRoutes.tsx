import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Route {
  id: string;
  routeId: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  status: 'active' | 'inactive' | 'maintenance';
  trips: number;
  occupancy: number;
}

const AdminRoutes = () => {
  const [routes] = useState<Route[]>([
    {
      id: '1',
      routeId: 'RT-001',
      origin: 'Jakarta',
      destination: 'Bandung',
      distance: 180,
      duration: '3h 30m',
      status: 'active',
      trips: 12,
      occupancy: 82,
    },
    {
      id: '2',
      routeId: 'RT-002',
      origin: 'Bandung',
      destination: 'Yogyakarta',
      distance: 420,
      duration: '7h 15m',
      status: 'active',
      trips: 8,
      occupancy: 75,
    },
    {
      id: '3',
      routeId: 'RT-003',
      origin: 'Jakarta',
      destination: 'Surabaya',
      distance: 780,
      duration: '12h 00m',
      status: 'active',
      trips: 5,
      occupancy: 90,
    },
    {
      id: '4',
      routeId: 'RT-004',
      origin: 'Bandung',
      destination: 'Jakarta',
      distance: 180,
      duration: '3h 30m',
      status: 'maintenance',
      trips: 0,
      occupancy: 0,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
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
        <p className="text-gray-400">Manage shuttle routes</p>
      </div>

      <Button className="mb-4">Add New Route</Button>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>{routes.length} routes in system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Active Trips</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.routeId}</TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell>{route.duration}</TableCell>
                  <TableCell>{route.trips}</TableCell>
                  <TableCell>{route.occupancy}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(route.status)}>
                      {route.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoutes;
