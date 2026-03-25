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

interface Booking {
  id: string;
  bookingId: string;
  passengerName: string;
  route: string;
  date: string;
  seats: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  paymentStatus: 'paid' | 'pending';
}

const AdminBookings = () => {
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      bookingId: 'BK-001',
      passengerName: 'John Doe',
      route: 'Jakarta - Bandung',
      date: '2024-01-15',
      seats: 'A1, A2',
      status: 'confirmed',
      amount: 250000,
      paymentStatus: 'paid',
    },
    {
      id: '2',
      bookingId: 'BK-002',
      passengerName: 'Jane Smith',
      route: 'Bandung - Jakarta',
      date: '2024-01-16',
      seats: 'B5',
      status: 'pending',
      amount: 125000,
      paymentStatus: 'pending',
    },
    {
      id: '3',
      bookingId: 'BK-003',
      passengerName: 'Mike Johnson',
      route: 'Jakarta - Surabaya',
      date: '2024-01-17',
      seats: 'C1, C2, C3',
      status: 'confirmed',
      amount: 375000,
      paymentStatus: 'paid',
    },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return variants[status] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    return status === 'paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-gray-400">Manage all passenger bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>{bookings.length} total bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.bookingId}</TableCell>
                  <TableCell>{booking.passengerName}</TableCell>
                  <TableCell>{booking.route}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.seats}</TableCell>
                  <TableCell>Rp {booking.amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentBadge(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
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

export default AdminBookings;
