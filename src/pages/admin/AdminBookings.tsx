import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminBookings } from '@/hooks/admin/useAdminBookings';
import { Skeleton } from '@/components/ui/skeleton';

const AdminBookings = () => {
  const { data: bookings = [], isLoading } = useAdminBookings();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      picked_up: 'bg-green-100 text-green-800',
      no_show: 'bg-red-100 text-red-800',
    };
    return variants[status] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    return status === 'paid' || status === 'COMPLETED'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">Manage all passenger bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>{bookings.length} total bookings</CardDescription>
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
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium font-mono text-xs">{booking.id.slice(0, 8)}</TableCell>
                    <TableCell>{booking.passenger_name}</TableCell>
                    <TableCell className="font-mono text-xs">{booking.trip_id.slice(0, 8)}</TableCell>
                    <TableCell>{booking.seat_number}</TableCell>
                    <TableCell>Rp {booking.fare.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentBadge(booking.payment_status)}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
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

export default AdminBookings;
