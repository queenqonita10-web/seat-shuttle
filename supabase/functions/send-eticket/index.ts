import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'resend';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  const { booking_id } = await req.json();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, passengers:profiles(*), trips(*, routes(*)) ')
    .eq('id', booking_id)
    .single();

  if (error || !booking) {
    return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
  }

  // Generate a simple e-ticket HTML
  const eticketHtml = `<h1>E-Ticket for ${booking.trips.routes.name}</h1><p>Booking ID: ${booking.id}</p>`;

  await resend.emails.send({
    from: 'noreply@pyugo.com',
    to: booking.passengers.email,
    subject: `Your E-Ticket for ${booking.trips.routes.name}`,
    html: eticketHtml,
  });

  return new Response(JSON.stringify({ status: 'sent' }), { status: 200 });
});
