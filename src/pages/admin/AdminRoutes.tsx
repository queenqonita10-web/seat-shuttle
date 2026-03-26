import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useAdminRoutes, useAdminRouteCreate, useAdminRouteUpdate, useAdminRouteDelete,
} from '@/hooks/admin/useAdminRoutes';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const routeSchema = z.object({
  id: z.string().optional(),
  route_code: z.string().min(3, 'Route code must be at least 3 characters'),
  name: z.string().min(5, 'Name must be at least 5 characters'),
  origin: z.string().min(3, 'Origin must be at least 3 characters'),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  distance: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Distance must be a positive number'),
  ),
  estimated_time: z.string().min(1, 'Estimated time is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type RouteFormValues = z.infer<typeof routeSchema>;

const AdminRoutes = () => {
  const { data: routes = [], isLoading } = useAdminRoutes();
  const createRoute = useAdminRouteCreate();
  const updateRoute = useAdminRouteUpdate();
  const deleteRoute = useAdminRouteDelete();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteFormValues | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register, handleSubmit, control, reset, formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    return variants[status] || variants.inactive;
  };

  const handleAddNew = () => {
    setEditingRoute(null);
    reset({
      route_code: '',
      name: '',
      origin: '',
      destination: '',
      distance: 0,
      estimated_time: '',
      description: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (route: RouteWithPickups) => {
    setEditingRoute(route);
    reset(route);
    setIsDialogOpen(true);
  };

  const handleDelete = async (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      await deleteRoute.mutateAsync(routeId);
    }
  };

  const onSubmit = async (data: RouteFormValues) => {
    try {
      if (editingRoute && editingRoute.id) {
        await updateRoute.mutateAsync({ id: editingRoute.id, updates: data });
      } else {
        const { id, ...createData } = data;
        await createRoute.mutateAsync({
          ...createData,
          id: `RTE-${Date.now()}`,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled by the mutation's onError
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const query = searchQuery.toLowerCase();
    return (
      route.name.toLowerCase().includes(query) ||
      route.origin.toLowerCase().includes(query) ||
      route.destination.toLowerCase().includes(query) ||
      route.route_code.toLowerCase().includes(query)
    );
  });
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Routes</h1>
        <p className="text-muted-foreground">Manage shuttle routes</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 mr-4">
          <Input 
            placeholder="Search by name, origin, destination, or code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Route
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>{filteredRoutes.length} routes found</CardDescription>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No routes found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.route_code}</TableCell>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>{route.origin}</TableCell>
                      <TableCell>{route.destination}</TableCell>
                      <TableCell>{route.distance} km</TableCell>
                      <TableCell>{route.estimated_time}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(route.status)}>
                          {route.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(route)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(route.id)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="route_code" className="text-right">Route Code</Label>
              <Input id="route_code" {...register("route_code")} className="col-span-3" />
              {errors.route_code && <p className="col-span-4 text-red-500 text-sm">{errors.route_code.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="origin" className="text-right">Origin</Label>
              <Input id="origin" {...register("origin")} className="col-span-3" />
              {errors.origin && <p className="col-span-4 text-red-500 text-sm">{errors.origin.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="destination" className="text-right">Destination</Label>
              <Input id="destination" {...register("destination")} className="col-span-3" />
              {errors.destination && <p className="col-span-4 text-red-500 text-sm">{errors.destination.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right">Distance (km)</Label>
              <Input id="distance" type="number" {...register("distance")} className="col-span-3" />
              {errors.distance && <p className="col-span-4 text-red-500 text-sm">{errors.distance.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimated_time" className="text-right">Est. Time</Label>
              <Input id="estimated_time" {...register("estimated_time")} className="col-span-3" />
              {errors.estimated_time && <p className="col-span-4 text-red-500 text-sm">{errors.estimated_time.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" {...register("description")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRoute.isPending || updateRoute.isPending}>
                {createRoute.isPending || updateRoute.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoutes;
