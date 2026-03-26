import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const payload = await req.json();

  // Basic validation
  if (payload.transaction_status === 'capture' || payload.transaction_status === 'settlement') {
    const bookingId = payload.order_id;
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_id: payload.transaction_id })
      .eq('id', bookingId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Trigger e-ticket sending
    await supabase.functions.invoke('send-eticket', { body: { booking_id: bookingId } });
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
});
