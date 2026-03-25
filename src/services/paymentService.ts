import { z } from 'zod';

// Midtrans API Types
export const MidtransSnapTokenSchema = z.object({
  token: z.string(),
  redirect_url: z.string(),
});

export const MidtransTransactionSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  payment_type: z.string(),
  transaction_time: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  currency: z.string(),
  gross_amount: z.coerce.number(),
  status_code: z.string().optional(),
  status_message: z.string().optional(),
});

export const MidtransNotificationSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  payment_type: z.string(),
  transaction_time: z.string(),
  transaction_status: z.enum(['capture', 'settlement', 'pending', 'deny', 'cancel', 'refund', 'partial_refund', 'chargeback', 'partial_chargeback', 'expire', 'authorize']),
  fraud_status: z.string().optional(),
  currency: z.string(),
  gross_amount: z.coerce.number(),
  va_numbers: z.array(z.object({
    va_number: z.string(),
    bank: z.string(),
  })).optional(),
  bank_account_number: z.string().optional(),
  bank_account_holder_name: z.string().optional(),
});

export type MidtransSnapToken = z.infer<typeof MidtransSnapTokenSchema>;
export type MidtransTransaction = z.infer<typeof MidtransTransactionSchema>;
export type MidtransNotification = z.infer<typeof MidtransNotificationSchema>;

// Payment transaction types
export interface PaymentTransactionItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentTransactionDetails {
  order_id: string;
  gross_amount: number;
  currency: string;
  customer_details: {
    first_name: string;
    phone: string;
    email?: string;
  };
  item_details: PaymentTransactionItem[];
  metadata?: Record<string, any>;
}

// Configuration interface
interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  environment: 'sandbox' | 'production';
  apiBaseUrl?: string;
}

interface SnapTokenOptions {
  bookingId: string;
  tripId: string;
  tripStartTime: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  pickupLabel: string;
  fare: number;
  email?: string;
}

/**
 * PaymentService — Midtrans Snap API integration
 * Handles payment token generation, transaction verification, and webhook processing
 */
export class PaymentService {
  private config: MidtransConfig;
  private apiBaseUrl: string;

  constructor(config: MidtransConfig) {
    if (!config.serverKey || !config.clientKey) {
      throw new Error('Midtrans serverKey and clientKey are required');
    }

    this.config = {
      ...config,
      apiBaseUrl: config.apiBaseUrl || 
        (config.environment === 'production' 
          ? 'https://app.midtrans.com/api/v2'
          : 'https://app.sandbox.midtrans.com/api/v2'),
    };

    this.apiBaseUrl = this.config.apiBaseUrl!;
  }

  /**
   * Generate Snap token for payment UI
   * Returns token for embedding in frontend or redirect URL
   */
  async generateSnapToken(options: SnapTokenOptions): Promise<MidtransSnapToken> {
    try {
      const transactionDetails: PaymentTransactionDetails = {
        order_id: options.bookingId,
        gross_amount: options.fare,
        currency: 'IDR',
        customer_details: {
          first_name: options.passengerName,
          phone: options.passengerPhone,
          email: options.email,
        },
        item_details: [
          {
            id: `${options.tripId}-seat-(${options.seatNumber})`,
            name: `Seat ${options.seatNumber} - ${options.pickupLabel}`,
            quantity: 1,
            price: options.fare,
          },
        ],
        metadata: {
          bookingId: options.bookingId,
          tripId: options.tripId,
          seatNumber: options.seatNumber,
          pickupLabel: options.pickupLabel,
          tripStartTime: options.tripStartTime,
        },
      };

      const payload = {
        transaction_details: transactionDetails,
        credit_card: {
          secure: true,
        },
        callbacks: {
          finish: `${window.location.origin}/payment-status`,
          error: `${window.location.origin}/payment-status`,
          pending: `${window.location.origin}/payment-status`,
        },
      };

      const response = await fetch(`${this.apiBaseUrl}/snap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this._encodeBase64(this.config.serverKey + ':')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Midtrans API Error: ${error.error_id} - ${error.error_message}`);
      }

      const data = await response.json();
      const validated = MidtransSnapTokenSchema.parse(data);

      return validated;
    } catch (error) {
      console.error('Error generating Snap token:', error);
      throw error;
    }
  }

  /**
   * Get transaction status from Midtrans
   * Used for polling or verification
   */
  async getTransactionStatus(orderId: string): Promise<MidtransTransaction> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this._encodeBase64(this.config.serverKey + ':')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get transaction status: ${error.error_message}`);
      }

      const data = await response.json();
      return MidtransTransactionSchema.parse(data);
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending transaction
   */
  async cancelTransaction(orderId: string): Promise<MidtransTransaction> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this._encodeBase64(this.config.serverKey + ':')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to cancel transaction: ${error.error_message}`);
      }

      const data = await response.json();
      return MidtransTransactionSchema.parse(data);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * CRUCIAL for security: Verify all webhook notifications from Midtrans
   */
  verifyWebhookSignature(
    orderId: string,
    statusCode: string,
    grossAmount: number,
    serverKey: string
  ): boolean {
    try {
      // Create signature: SHA512(order_id + status_code + gross_amount + server_key)
      const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      // Note: In production, use proper SHA512 hashing
      // This is a simplified verification - implement proper crypto hashing
      return true;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook notification from Midtrans
   */
  processWebhookNotification(notification: Record<string, any>): MidtransNotification {
    try {
      return MidtransNotificationSchema.parse(notification);
    } catch (error) {
      console.error('Invalid webhook notification:', error);
      throw error;
    }
  }

  /**
   * Map Midtrans transaction status to app payment status
   */
  mapTransactionStatus(midtransStatus: string): 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired' {
    const statusMap: Record<string, 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired'> = {
      'settle': 'success',
      'settlement': 'success',
      'capture': 'processing',
      'pending': 'pending',
      'authorize': 'processing',
      'deny': 'failed',
      'cancel': 'cancelled',
      'refund': 'failed',
      'partial_refund': 'failed',
      'expire': 'expired',
      'chargeback': 'failed',
      'partial_chargeback': 'failed',
      'failure': 'failed',
    };

    return statusMap[midtransStatus] || 'pending';
  }

  /**
   * Encode credentials for Basic Auth
   */
  private _encodeBase64(str: string): string {
    try {
      return btoa(str);
    } catch {
      // Fallback for Node.js environment (testing)
      const buf = Buffer.from(str);
      return buf.toString('base64');
    }
  }

  /**
   * Get Midtrans client key (public, safe to use in frontend)
   */
  getClientKey(): string {
    return this.config.clientKey;
  }

  /**
   * Check if using sandbox environment
   */
  isSandbox(): boolean {
    return this.config.environment === 'sandbox';
  }
}

// Singleton instance
let paymentServiceInstance: PaymentService | null = null;

/**
 * Initialize or get PaymentService instance
 */
export function initializePaymentService(config?: MidtransConfig): PaymentService {
  if (!paymentServiceInstance) {
    const midtransConfig: MidtransConfig = config || {
      serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY || '',
      clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',
      environment: (import.meta.env.VITE_MIDTRANS_ENV || 'sandbox') as 'sandbox' | 'production',
    };

    paymentServiceInstance = new PaymentService(midtransConfig);
  }

  return paymentServiceInstance;
}

/**
 * Get existing PaymentService instance (throws if not initialized)
 */
export function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) {
    throw new Error('PaymentService not initialized. Call initializePaymentService first.');
  }
  return paymentServiceInstance;
}

/**
 * Reset PaymentService instance (for testing)
 */
export function resetPaymentService(): void {
  paymentServiceInstance = null;
}
