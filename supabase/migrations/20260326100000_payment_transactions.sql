-- =============================================
-- Payment Transactions Table (Phase 4)
-- =============================================

-- Enum for transaction status
CREATE TYPE public.payment_status_enum AS ENUM (
  'pending',
  'processing',
  'success',
  'failed',
  'cancelled',
  'expired'
);

-- Payment transactions table (Midtrans integration)
CREATE TABLE public.payment_transactions (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  midtrans_transaction_id TEXT UNIQUE,
  midtrans_order_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status public.payment_status_enum NOT NULL DEFAULT 'pending',
  
  -- Midtrans response data
  transaction_time TIMESTAMPTZ,
  transaction_status TEXT,
  fraud_status TEXT,
  payment_type TEXT,
  
  -- Verification details
  snap_token TEXT,
  snap_redirect_url TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  error_code TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Users can create payment transactions" ON public.payment_transactions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all transactions" ON public.payment_transactions 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for payment_transactions
CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(midtrans_order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- Update booking payment_method to accept Midtrans payment types
ALTER TABLE public.bookings ADD CONSTRAINT valid_payment_method 
  CHECK (payment_method IN ('Cash', 'credit_card', 'bank_transfer', 'ewallet', 'qris'));
