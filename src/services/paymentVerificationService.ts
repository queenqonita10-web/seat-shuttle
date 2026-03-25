import { supabase } from '@/integrations/supabase/client';
import { PaymentService } from './paymentService';
import { z } from 'zod';

/**
 * PaymentTransactionRecord — Database interface
 */
export const PaymentTransactionRecordSchema = z.object({
  id: z.string(),
  booking_id: z.string(),
  midtrans_transaction_id: z.string().nullable(),
  midtrans_order_id: z.string(),
  payment_method: z.string(),
  amount: z.number(),
  currency: z.string().default('IDR'),
  status: z.enum(['pending', 'processing', 'success', 'failed', 'cancelled', 'expired']),
  transaction_time: z.string().nullable(),
  transaction_status: z.string().nullable(),
  fraud_status: z.string().nullable(),
  payment_type: z.string().nullable(),
  snap_token: z.string().nullable(),
  snap_redirect_url: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
});

export type PaymentTransactionRecord = z.infer<typeof PaymentTransactionRecordSchema>;

interface CreatePaymentTransactionOptions {
  bookingId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  metadata?: Record<string, any>;
}

interface VerifyPaymentOptions {
  bookingId: string;
  orderId: string;
  paymentTransaction: PaymentTransactionRecord;
}

/**
 * PaymentVerificationService — Manages payment transaction records in Supabase
 * Handles storage, verification, and status updates
 */
export class PaymentVerificationService {
  constructor(private paymentService: PaymentService) {}

  /**
   * Create a new payment transaction record
   */
  async createPaymentTransaction(
    options: CreatePaymentTransactionOptions
  ): Promise<PaymentTransactionRecord> {
    try {
      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .insert({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          booking_id: options.bookingId,
          midtrans_order_id: options.orderId,
          payment_method: options.paymentMethod,
          amount: options.amount,
          currency: 'IDR',
          status: 'pending',
          snap_token: options.snapToken || null,
          snap_redirect_url: options.snapRedirectUrl || null,
          metadata: options.metadata || null,
        })
        .select()
        .single() as any);

      if (error) {
        throw new Error(`Failed to create payment transaction: ${error.message}`);
      }

      return PaymentTransactionRecordSchema.parse(data);
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction by booking ID
   */
  async getPaymentTransaction(bookingId: string): Promise<PaymentTransactionRecord | null> {
    try {
      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as any);

      if (error) {
        throw new Error(`Failed to fetch payment transaction: ${error.message}`);
      }

      return data ? PaymentTransactionRecordSchema.parse(data) : null;
    } catch (error) {
      console.error('Error fetching payment transaction:', error);
      throw error;
    }
  }

  /**
   * Verify payment status with Midtrans and update database
   */
  async verifyPayment(options: VerifyPaymentOptions): Promise<PaymentTransactionRecord> {
    try {
      const { bookingId, orderId, paymentTransaction } = options;

      // Fetch current status from Midtrans
      const midtransTransaction = await this.paymentService.getTransactionStatus(orderId);

      // Map status to app status
      const appStatus = this.paymentService.mapTransactionStatus(midtransTransaction.transaction_status);

      // Update payment transaction record in database
      const updateData: Partial<PaymentTransactionRecord> = {
        midtrans_transaction_id: midtransTransaction.transaction_id,
        status: appStatus as any,
        transaction_time: midtransTransaction.transaction_time || null,
        transaction_status: midtransTransaction.transaction_status || null,
        fraud_status: midtransTransaction.fraud_status || null,
        payment_type: midtransTransaction.payment_type || null,
      };

      // Set completion time if payment succeeded
      if (appStatus === 'success') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .update(updateData)
        .eq('id', paymentTransaction.id)
        .select()
        .single() as any);

      if (error) {
        throw new Error(`Failed to update payment transaction: ${error.message}`);
      }

      // If payment succeeded, update booking payment_status
      if (appStatus === 'success') {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', bookingId);

        if (bookingError) {
          console.error('Failed to update booking payment status:', bookingError);
          // Don't throw - payment still succeeded, just log the error
        }
      }

      return PaymentTransactionRecordSchema.parse(data);
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Update payment status from webhook notification
   */
  async handleWebhookNotification(
    notification: Record<string, any>
  ): Promise<PaymentTransactionRecord | null> {
    try {
      // Validate webhook notification
      const midtransNotification = this.paymentService.processWebhookNotification(notification);

      // Find corresponding payment transaction
      const { data: transactions, error: fetchError } = await (supabase
        .from('payment_transactions' as any)
        .select('*')
        .eq('midtrans_order_id', midtransNotification.order_id)
        .limit(1) as any);

      if (fetchError || !transactions || transactions.length === 0) {
        console.error('Payment transaction not found for order:', midtransNotification.order_id);
        return null;
      }

      const paymentTransaction = PaymentTransactionRecordSchema.parse(transactions[0]);

      // Map Midtrans status to app status
      let appStatus = this.paymentService.mapTransactionStatus(midtransNotification.transaction_status);

      // Store webhook data in metadata
      const metadata = {
        ...paymentTransaction.metadata,
        webhook_notification: {
          received_at: new Date().toISOString(),
          transaction_status: midtransNotification.transaction_status,
          fraud_status: midtransNotification.fraud_status,
        },
      };

      // Update payment transaction
      const { data, error: updateError } = await (supabase
        .from('payment_transactions' as any)
        .update({
          midtrans_transaction_id: midtransNotification.transaction_id,
          status: appStatus as any,
          transaction_time: midtransNotification.transaction_time,
          transaction_status: midtransNotification.transaction_status,
          fraud_status: midtransNotification.fraud_status || null,
          payment_type: midtransNotification.payment_type,
          metadata,
          completed_at: appStatus === 'success' ? new Date().toISOString() : null,
        })
        .eq('id', paymentTransaction.id)
        .select()
        .single() as any);

      if (updateError) {
        throw new Error(`Failed to update transaction from webhook: ${updateError.message}`);
      }

      const updatedTransaction = PaymentTransactionRecordSchema.parse(data);

      // Update booking payment status if payment succeeded
      if (appStatus === 'success') {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', paymentTransaction.booking_id);

        if (bookingError) {
          console.error('Failed to update booking after webhook:', bookingError);
        }
      }

      return updatedTransaction;
    } catch (error) {
      console.error('Error handling webhook notification:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    bookingId: string,
    reason?: string
  ): Promise<PaymentTransactionRecord> {
    try {
      // Get payment transaction
      const paymentTransaction = await this.getPaymentTransaction(bookingId);

      if (!paymentTransaction) {
        throw new Error('Payment transaction not found');
      }

      if (paymentTransaction.status !== 'success') {
        throw new Error('Can only refund successful payments');
      }

      // Call Midtrans refund API
      if (paymentTransaction.midtrans_order_id) {
        // Note: Refund API requires special implementation
        // This is a simplified version
        console.log(`Refunding payment for order: ${paymentTransaction.midtrans_order_id}`, reason);
      }

      // Update payment transaction status
      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .update({
          status: 'cancelled',
          metadata: {
            ...paymentTransaction.metadata,
            refund_reason: reason || 'User requested refund',
            refunded_at: new Date().toISOString(),
          },
        })
        .eq('id', paymentTransaction.id)
        .select()
        .single() as any);

      if (error) {
        throw new Error(`Failed to update refund status: ${error.message}`);
      }

      // Update booking payment status
      await supabase
        .from('bookings')
        .update({ payment_status: 'refunded' })
        .eq('id', bookingId);

      return PaymentTransactionRecordSchema.parse(data);
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction history
   */
  async getPaymentHistory(limit = 10): Promise<PaymentTransactionRecord[]> {
    try {
      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit) as any);

      if (error) {
        throw new Error(`Failed to fetch payment history: ${error.message}`);
      }

      return data.map((item: any) => PaymentTransactionRecordSchema.parse(item));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalTransactions: number;
    successfulPayments: number;
    totalRevenue: number;
    averageTransactionValue: number;
  }> {
    try {
      const { data, error } = await (supabase
        .from('payment_transactions' as any)
        .select('status, amount', { count: 'exact' })
        .eq('status', 'success') as any);

      if (error) {
        throw new Error(`Failed to fetch payment stats: ${error.message}`);
      }

      const totalAmount = (data as any[]).reduce((sum, item) => sum + item.amount, 0);
      const successCount = (data as any[]).length;

      const { count: totalCount } = await (supabase
        .from('payment_transactions' as any)
        .select('*', { count: 'exact', head: true }) as any);

      return {
        totalTransactions: totalCount || 0,
        successfulPayments: successCount,
        totalRevenue: totalAmount,
        averageTransactionValue: successCount > 0 ? totalAmount / successCount : 0,
      };
    } catch (error) {
      console.error('Error calculating payment stats:', error);
      throw error;
    }
  }
}

// Singleton instance
let verificationServiceInstance: PaymentVerificationService | null = null;

/**
 * Initialize PaymentVerificationService
 */
export function initializePaymentVerificationService(
  paymentService: PaymentService
): PaymentVerificationService {
  if (!verificationServiceInstance) {
    verificationServiceInstance = new PaymentVerificationService(paymentService);
  }
  return verificationServiceInstance;
}

/**
 * Get PaymentVerificationService instance
 */
export function getPaymentVerificationService(): PaymentVerificationService {
  if (!verificationServiceInstance) {
    throw new Error('PaymentVerificationService not initialized');
  }
  return verificationServiceInstance;
}

/**
 * Reset service (testing only)
 */
export function resetPaymentVerificationService(): void {
  verificationServiceInstance = null;
}
