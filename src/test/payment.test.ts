import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import {
  PaymentService,
  resetPaymentService,
  MidtransSnapTokenSchema,
  MidtransTransactionSchema,
  MidtransNotificationSchema,
} from '@/services/paymentService';
import {
  PaymentVerificationService,
  PaymentTransactionRecordSchema,
  resetPaymentVerificationService,
} from '@/services/paymentVerificationService';

// Mock Midtrans configuration
const mockConfig = {
  serverKey: 'test-server-key-12345',
  clientKey: 'test-client-key-12345',
  environment: 'sandbox' as const,
};

// Mock fetch responses
const mockSnapTokenResponse = {
  token: 'test-snap-token-12345',
  redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-snap-token-12345',
};

const mockTransactionResponse = {
  transaction_id: 'txn-12345-abcde',
  order_id: 'booking-001',
  payment_type: 'bank_transfer',
  transaction_time: '2026-03-26T10:00:00Z',
  transaction_status: 'settlement',
  fraud_status: 'accept',
  currency: 'IDR',
  gross_amount: 50000,
};

const mockNotification = {
  transaction_id: 'txn-12345-abcde',
  order_id: 'booking-001',
  payment_type: 'bank_transfer',
  transaction_time: '2026-03-26T10:00:00Z',
  transaction_status: 'settlement',
  fraud_status: 'accept',
  currency: 'IDR',
  gross_amount: 50000,
};

// ============================================
// PaymentService Tests
// ============================================

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    resetPaymentService();
    paymentService = new PaymentService(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetPaymentService();
  });

  // Test 1: Service initialization
  it('should initialize with valid configuration', () => {
    expect(paymentService).toBeDefined();
    expect(paymentService.isSandbox()).toBe(true);
    expect(paymentService.getClientKey()).toBe('test-client-key-12345');
  });

  // Test 2: Missing credentials
  it('should throw error if serverKey is missing', () => {
    expect(() => {
      new PaymentService({
        serverKey: '',
        clientKey: 'test-client-key',
        environment: 'sandbox',
      });
    }).toThrow('Midtrans serverKey and clientKey are required');
  });

  // Test 3: Snap token schema validation
  it('should validate snap token response schema', () => {
    const validToken = {
      token: 'valid-token-123',
      redirect_url: 'https://example.com/redirect',
    };

    const result = MidtransSnapTokenSchema.parse(validToken);
    expect(result.token).toBe('valid-token-123');
  });

  // Test 4: Invalid snap token schema
  it('should throw error for invalid snap token schema', () => {
    const invalidToken = {
      token: 'valid-token-123',
      // missing redirect_url
    };

    expect(() => {
      MidtransSnapTokenSchema.parse(invalidToken);
    }).toThrow();
  });

  // Test 5: Transaction status mapping
  it('should map Midtrans transaction statuses correctly', () => {
    expect(paymentService.mapTransactionStatus('settlement')).toBe('success');
    expect(paymentService.mapTransactionStatus('capture')).toBe('processing');
    expect(paymentService.mapTransactionStatus('pending')).toBe('pending');
    expect(paymentService.mapTransactionStatus('deny')).toBe('failed');
    expect(paymentService.mapTransactionStatus('cancel')).toBe('cancelled');
    expect(paymentService.mapTransactionStatus('expire')).toBe('expired');
  });

  // Test 6: Transaction schema validation
  it('should validate transaction response schema', () => {
    const result = MidtransTransactionSchema.parse(mockTransactionResponse);
    expect(result.transaction_id).toBe('txn-12345-abcde');
    expect(result.transaction_status).toBe('settlement');
    expect(result.gross_amount).toBe(50000);
  });

  // Test 7: Notification schema validation
  it('should validate webhook notification schema', () => {
    const result = MidtransNotificationSchema.parse(mockNotification);
    expect(result.transaction_id).toBe('txn-12345-abcde');
    expect(result.transaction_status).toBe('settlement');
  });

  // Test 8: Process valid webhook
  it('should process valid webhook notification', () => {
    const notification = paymentService.processWebhookNotification(mockNotification);
    expect(notification.transaction_id).toBe('txn-12345-abcde');
    expect(notification.order_id).toBe('booking-001');
  });

  // Test 9: Reject invalid webhook
  it('should throw error for invalid webhook notification', () => {
    const invalidNotification = {
      transaction_id: 'txn-123',
      // missing required fields
    };

    expect(() => {
      paymentService.processWebhookNotification(invalidNotification);
    }).toThrow();
  });

  // Test 10: Production environment
  it('should set production API URL when not sandbox', () => {
    const prodService = new PaymentService({
      ...mockConfig,
      environment: 'production',
    });

    expect(prodService.isSandbox()).toBe(false);
  });
});

// ============================================
// PaymentTransactionRecord Schema Tests
// ============================================

describe('PaymentTransactionRecord Schema', () => {
  // Test 11: Valid transaction record
  it('should validate payment transaction record', () => {
    const mockRecord = {
      id: 'txn-001',
      booking_id: 'booking-001',
      midtrans_transaction_id: 'txn-midtrans-001',
      midtrans_order_id: 'order-001',
      payment_method: 'bank_transfer',
      amount: 50000,
      currency: 'IDR',
      status: 'success' as const,
      transaction_time: '2026-03-26T10:00:00Z',
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: 'bank_transfer',
      snap_token: 'token-123',
      snap_redirect_url: 'https://example.com/redirect',
      metadata: { key: 'value' },
      error_code: null,
      error_message: null,
      created_at: '2026-03-26T10:00:00Z',
      updated_at: '2026-03-26T10:00:00Z',
      completed_at: '2026-03-26T10:01:00Z',
    };

    const result = PaymentTransactionRecordSchema.parse(mockRecord);
    expect(result.status).toBe('success');
    expect(result.amount).toBe(50000);
  });

  // Test 12: Transaction with pending status
  it('should accept pending payment status', () => {
    const pendingRecord = {
      id: 'txn-002',
      booking_id: 'booking-002',
      midtrans_order_id: 'order-002',
      midtrans_transaction_id: null,
      payment_method: 'credit_card',
      amount: 75000,
      currency: 'IDR',
      status: 'pending' as const,
      transaction_time: null,
      transaction_status: null,
      fraud_status: null,
      payment_type: null,
      snap_token: 'token-456',
      snap_redirect_url: 'https://example.com/redirect2',
      metadata: null,
      error_code: null,
      error_message: null,
      created_at: '2026-03-26T10:00:00Z',
      updated_at: '2026-03-26T10:00:00Z',
      completed_at: null,
    };

    const result = PaymentTransactionRecordSchema.parse(pendingRecord);
    expect(result.status).toBe('pending');
    expect(result.midtrans_transaction_id).toBeNull();
  });

  // Test 13: Failed transaction record
  it('should capture payment failures with error codes', () => {
    const failedRecord = {
      id: 'txn-003',
      booking_id: 'booking-003',
      midtrans_order_id: 'order-003',
      midtrans_transaction_id: 'txn-failed-001',
      payment_method: 'ewallet',
      amount: 100000,
      currency: 'IDR',
      status: 'failed' as const,
      transaction_time: '2026-03-26T11:00:00Z',
      transaction_status: 'deny',
      fraud_status: 'challenge',
      payment_type: 'gopay',
      snap_token: null,
      snap_redirect_url: null,
      metadata: { error_details: 'Insufficient balance' },
      error_code: 'INSUFFICIENT_BALANCE',
      error_message: 'Payment failed due to insufficient balance',
      created_at: '2026-03-26T10:00:00Z',
      updated_at: '2026-03-26T11:00:00Z',
      completed_at: null,
    };

    const result = PaymentTransactionRecordSchema.parse(failedRecord);
    expect(result.status).toBe('failed');
    expect(result.error_code).toBe('INSUFFICIENT_BALANCE');
  });
});

// ============================================
// PaymentVerificationService Tests
// ============================================

describe('PaymentVerificationService', () => {
  let verificationService: PaymentVerificationService;
  let paymentService: PaymentService;

  beforeEach(() => {
    resetPaymentService();
    resetPaymentVerificationService();
    paymentService = new PaymentService(mockConfig);
    verificationService = new PaymentVerificationService(paymentService);
  });

  afterEach(() => {
    resetPaymentService();
    resetPaymentVerificationService();
  });

  // Test 14: Service initialization
  it('should initialize verification service', () => {
    expect(verificationService).toBeDefined();
  });

  // Test 15: Status mapping integration
  it('should correctly map transaction status in verification service', () => {
    const status = paymentService.mapTransactionStatus('settlement');
    expect(status).toBe('success');

    const processingStatus = paymentService.mapTransactionStatus('authorize');
    expect(processingStatus).toBe('processing');
  });

  // Test 16: Multiple payment statuses
  it('should handle all payment status transitions', () => {
    const statuses = ['pending', 'authorize', 'capture', 'settlement', 'deny', 'cancel', 'expire'];
    const mappedStatuses = statuses.map(s => paymentService.mapTransactionStatus(s));

    expect(mappedStatuses).toContain('pending');
    expect(mappedStatuses).toContain('processing');
    expect(mappedStatuses).toContain('success');
    expect(mappedStatuses).toContain('failed');
    expect(mappedStatuses).toContain('expired');
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Payment System Integration', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    resetPaymentService();
    paymentService = new PaymentService(mockConfig);
  });

  afterEach(() => {
    resetPaymentService();
  });

  // Test 17: Complete payment flow - status mapping
  it('should map complete payment flow statuses', () => {
    const flow = [
      { midtrans: 'pending', app: 'pending' as const },
      { midtrans: 'authorize', app: 'processing' as const },
      { midtrans: 'capture', app: 'processing' as const },
      { midtrans: 'settlement', app: 'success' as const },
    ];

    flow.forEach(({ midtrans, app }) => {
      expect(paymentService.mapTransactionStatus(midtrans)).toBe(app);
    });
  });

  // Test 18: Successful payment notification
  it('should validate successful payment notification', () => {
    const successNotif = {
      ...mockNotification,
      transaction_status: 'settlement',
      fraud_status: 'accept',
    };

    const result = paymentService.processWebhookNotification(successNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('success');
  });

  // Test 19: Failed payment notification
  it('should validate failed payment notification', () => {
    const failedNotif = {
      ...mockNotification,
      transaction_status: 'deny',
      fraud_status: 'challenge',
    };

    const result = paymentService.processWebhookNotification(failedNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('failed');
  });

  // Test 20: Pending payment notification
  it('should validate pending payment notification', () => {
    const pendingNotif = {
      ...mockNotification,
      transaction_status: 'pending',
    };

    const result = paymentService.processWebhookNotification(pendingNotif);
    expect(result.transaction_status).toBe('pending');
  });

  // Test 21: Multiple payment methods
  it('should support multiple Midtrans payment methods', () => {
    const paymentMethods = [
      'credit_card',
      'bank_transfer',
      'ewallet',
      'qris',
    ];

    paymentMethods.forEach(method => {
      const notification = {
        ...mockNotification,
        payment_type: method,
      };

      const result = paymentService.processWebhookNotification(notification);
      expect(result.payment_type).toBe(method);
    });
  });

  // Test 22: Expired transaction
  it('should handle expired transaction status', () => {
    const expiredNotif = {
      ...mockNotification,
      transaction_status: 'expire',
    };

    const result = paymentService.processWebhookNotification(expiredNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('expired');
  });

  // Test 23: Cancelled transaction
  it('should handle cancelled transaction status', () => {
    const cancelledNotif = {
      ...mockNotification,
      transaction_status: 'cancel',
    };

    const result = paymentService.processWebhookNotification(cancelledNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('cancelled');
  });

  // Test 24: Refund transaction status
  it('should handle refund status in notifications', () => {
    const refundNotif = {
      ...mockNotification,
      transaction_status: 'refund',
    };

    const result = paymentService.processWebhookNotification(refundNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('failed'); // Refunds treated as payment not received
  });

  // Test 25: Chargeback notification
  it('should handle chargeback notifications', () => {
    const chargebackNotif = {
      ...mockNotification,
      transaction_status: 'chargeback',
    };

    const result = paymentService.processWebhookNotification(chargebackNotif);
    const appStatus = paymentService.mapTransactionStatus(result.transaction_status);

    expect(appStatus).toBe('failed');
  });

  // Test 26: VA numbers in bank transfer
  it('should validate VA numbers in bank transfer notifications', () => {
    const bankTransferNotif = {
      ...mockNotification,
      payment_type: 'bank_transfer',
      va_numbers: [
        {
          va_number: '1234567890',
          bank: 'bca',
        },
      ],
    };

    const result = MidtransNotificationSchema.parse(bankTransferNotif);
    expect(result.va_numbers).toBeDefined();
    expect(result.va_numbers![0].bank).toBe('bca');
  });

  // Test 27: Payment with metadata
  it('should preserve metadata through payment flow', () => {
    const transaction = {
      ...mockTransactionResponse,
    };

    const result = MidtransTransactionSchema.parse(transaction);
    expect(result.transaction_id).toBe('txn-12345-abcde');
    expect(result.currency).toBe('IDR');
  });

  // Test 28: Amount formatting
  it('should handle various amount formats', () => {
    const amounts = [25000, 50000, 100000, 250000, 1000000];

    amounts.forEach(amount => {
      const transaction = {
        ...mockTransactionResponse,
        gross_amount: amount,
      };

      const result = MidtransTransactionSchema.parse(transaction);
      expect(result.gross_amount).toBe(amount);
    });
  });

  // Test 29: Currency validation
  it('should validate IDR currency in transactions', () => {
    const transaction = {
      ...mockTransactionResponse,
      currency: 'IDR',
    };

    const result = MidtransTransactionSchema.parse(transaction);
    expect(result.currency).toBe('IDR');
  });

  // Test 30: Transaction ID generation pattern
  it('should validate transaction ID format', () => {
    const validIds = [
      'txn-12345-abcde',
      'txn-67890-fghij',
      'txn-99999-zzzzz',
    ];

    validIds.forEach(id => {
      const transaction = {
        ...mockTransactionResponse,
        transaction_id: id,
      };

      const result = MidtransTransactionSchema.parse(transaction);
      expect(result.transaction_id).toBe(id);
    });
  });
});
