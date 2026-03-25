import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PaymentService, initializePaymentService } from '@/services/paymentService';
import {
  PaymentVerificationService,
  initializePaymentVerificationService,
  PaymentTransactionRecord,
} from '@/services/paymentVerificationService';

export interface UsePaymentOptions {
  bookingId: string;
  tripId: string;
  tripStartTime: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  pickupLabel: string;
  fare: number;
  email?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: Error) => void;
}

interface PaymentState {
  isLoading: boolean;
  isProcessing: boolean;
  error: Error | null;
  snapToken: string | null;
  snapRedirectUrl: string | null;
  transactionStatus: 'idle' | 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired';
  paymentTransaction: PaymentTransactionRecord | null;
}

/**
 * usePayment — React hook for Midtrans payment integration
 * Manages payment flow: token generation → UI display → verification
 */
export function usePayment(options: UsePaymentOptions) {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isProcessing: false,
    error: null,
    snapToken: null,
    snapRedirectUrl: null,
    transactionStatus: 'idle',
    paymentTransaction: null,
  });

  // Services references
  const paymentServiceRef = useRef<PaymentService | null>(null);
  const verificationServiceRef = useRef<PaymentVerificationService | null>(null);
  const midtransScriptLoadedRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    try {
      paymentServiceRef.current = initializePaymentService();
      verificationServiceRef.current = initializePaymentVerificationService(paymentServiceRef.current);

      // Load Midtrans Snap library
      if (!window.snap) {
        const script = document.createElement('script');
        script.src = paymentServiceRef.current.isSandbox()
          ? 'https://app.sandbox.midtrans.com/snap/snap.js'
          : 'https://app.midtrans.com/snap/snap.js';
        script.async = true;
        script.onload = () => {
          midtransScriptLoadedRef.current = true;
          if (window.snap) {
            window.snap.setClientKey(paymentServiceRef.current!.getClientKey());
          }
        };
        document.body.appendChild(script);
      } else {
        midtransScriptLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to initialize payment services:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to initialize payment'),
      }));
    }

    return () => {
      // Cleanup polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  /**
   * Generate Snap token and prepare payment UI
   */
  const generatePaymentToken = useCallback(async () => {
    if (!paymentServiceRef.current || !verificationServiceRef.current) {
      throw new Error('Payment services not initialized');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate Snap token from Midtrans
      const snapResponse = await paymentServiceRef.current.generateSnapToken({
        bookingId: options.bookingId,
        tripId: options.tripId,
        tripStartTime: options.tripStartTime,
        passengerName: options.passengerName,
        passengerPhone: options.passengerPhone,
        seatNumber: options.seatNumber,
        pickupLabel: options.pickupLabel,
        fare: options.fare,
        email: options.email,
      });

      // Create payment transaction record in database
      const paymentTransaction = await verificationServiceRef.current.createPaymentTransaction({
        bookingId: options.bookingId,
        orderId: options.bookingId, // Order ID is booking ID
        amount: options.fare,
        paymentMethod: 'midtrans',
        snapToken: snapResponse.token,
        snapRedirectUrl: snapResponse.redirect_url,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        snapToken: snapResponse.token,
        snapRedirectUrl: snapResponse.redirect_url,
        transactionStatus: 'pending',
        paymentTransaction,
      }));

      return snapResponse;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to generate payment token');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err,
      }));
      throw err;
    }
  }, [options]);

  /**
   * Process payment with Midtrans Snap
   */
  const processPayment = useCallback(async () => {
    // Wait for Midtrans script to load
    if (!midtransScriptLoadedRef.current) {
      toast.error('Payment system loading. Please try again.');
      return;
    }

    if (!window.snap) {
      toast.error('Payment system not available');
      return;
    }

    if (!state.snapToken) {
      toast.error('Payment token not generated. Please try again.');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Open Midtrans Snap payment UI
      await new Promise<void>((resolve, reject) => {
        window.snap.pay(state.snapToken!, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            toast.success('Pembayaran berhasil diproses!');
            setState(prev => ({
              ...prev,
              isProcessing: false,
              transactionStatus: 'success',
            }));
            options.onPaymentSuccess?.();
            resolve();
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            toast.info('Pembayaran sedang diproses...');
            setState(prev => ({
              ...prev,
              transactionStatus: 'processing',
            }));
          },
          onError: (error: any) => {
            console.error('Payment error:', error);
            const err = new Error(error.message || 'Payment failed');
            setState(prev => ({
              ...prev,
              isProcessing: false,
              error: err,
              transactionStatus: 'failed',
            }));
            options.onPaymentError?.(err);
            toast.error('Pembayaran gagal. Silakan coba lagi.');
            reject(err);
          },
          onClose: () => {
            console.log('Payment UI closed');
            setState(prev => ({
              ...prev,
              isProcessing: false,
            }));
          },
        });
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Payment processing error');
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: err,
      }));
    }
  }, [state.snapToken, options]);

  /**
   * Verify payment status with Midtrans
   */
  const verifyPayment = useCallback(async () => {
    if (!state.paymentTransaction || !verificationServiceRef.current) {
      throw new Error('Payment transaction not found');
    }

    try {
      const verified = await verificationServiceRef.current.verifyPayment({
        bookingId: options.bookingId,
        orderId: options.bookingId,
        paymentTransaction: state.paymentTransaction,
      });

      setState(prev => ({
        ...prev,
        paymentTransaction: verified,
        transactionStatus: verified.status as any,
      }));

      // If payment succeeded, update the callback
      if (verified.status === 'success' && options.onPaymentSuccess) {
        options.onPaymentSuccess();
      }

      return verified;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Payment verification failed');
      setState(prev => ({
        ...prev,
        error: err,
      }));
      throw err;
    }
  }, [state.paymentTransaction, options]);

  /**
   * Poll payment status periodically
   */
  const startStatusPolling = useCallback((intervalMs = 3000) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const verified = await verifyPayment();
        if (verified.status === 'success' || verified.status === 'failed' || verified.status === 'cancelled') {
          // Stop polling once status is final
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, intervalMs);
  }, [verifyPayment]);

  /**
   * Stop status polling
   */
  const stopStatusPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle redirect URL from Midtrans
   */
  const openRedirectPayment = useCallback(() => {
    if (!state.snapRedirectUrl) {
      toast.error('Redirect URL not available');
      return;
    }

    window.open(state.snapRedirectUrl, '_self');
  }, [state.snapRedirectUrl]);

  /**
   * Retry payment (for failed payments)
   */
  const retryPayment = useCallback(async () => {
    setState(prev => ({
      ...prev,
      error: null,
      transactionStatus: 'idle',
    }));

    try {
      await generatePaymentToken();
    } catch (error) {
      console.error('Failed to retry payment:', error);
    }
  }, [generatePaymentToken]);

  /**
   * Cancel payment
   */
  const cancelPayment = useCallback(async () => {
    try {
      if (state.paymentTransaction?.midtrans_order_id && paymentServiceRef.current) {
        await paymentServiceRef.current.cancelTransaction(state.paymentTransaction.midtrans_order_id);
      }

      setState(prev => ({
        ...prev,
        snapToken: null,
        transactionStatus: 'cancelled',
      }));

      toast.info('Pembayaran dibatalkan');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to cancel payment');
      setState(prev => ({
        ...prev,
        error: err,
      }));
      console.error('Error cancelling payment:', error);
    }
  }, [state.paymentTransaction]);

  return {
    // State
    isLoading: state.isLoading,
    isProcessing: state.isProcessing,
    error: state.error,
    snapToken: state.snapToken,
    transactionStatus: state.transactionStatus,
    paymentTransaction: state.paymentTransaction,

    // Methods
    generatePaymentToken,
    processPayment,
    verifyPayment,
    startStatusPolling,
    stopStatusPolling,
    openRedirectPayment,
    retryPayment,
    cancelPayment,
  };
}

// Extend Window interface for Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay(token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (error: any) => void;
        onClose?: () => void;
      }): void;
      setClientKey(key: string): void;
    };
  }
}
