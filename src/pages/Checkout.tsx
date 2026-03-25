import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useRoutes } from "@/hooks/useRoutes";
import { useCreateBooking } from "@/hooks/useBookings";
import { usePayment } from "@/hooks/usePayment";
import { formatPrice, getPickupTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CreditCard, Wallet, QrCode, MapPin, Armchair, Clock, DollarSign, AlertCircle, User, Phone, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const paymentMethods = [
  { id: "ewallet", label: "E-Wallet", icon: Wallet, description: "GoPay, OVO, Dana (via Midtrans)" },
  { id: "credit_card", label: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "bank_transfer", label: "Bank Transfer", icon: CreditCard, description: "BCA, Mandiri, BNI, CIMB" },
  { id: "qris", label: "QRIS", icon: QrCode, description: "Scan to pay" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, pickupPoint, passengerName, passengerPhone, setPassengerName, setPassengerPhone, setBooking } = useBooking();
  const { data: routes = [] } = useRoutes();
  const createBooking = useCreateBooking();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [processing, setProcessing] = useState(false);

  // Payment integration via Midtrans
  const payment = usePayment({
    bookingId: selectedTrip?.id || '',
    tripId: selectedTrip?.id || '',
    tripStartTime: selectedTrip?.departure_time || '',
    passengerName,
    passengerPhone,
    seatNumber: selectedSeat || '',
    pickupLabel: pickupPoint?.label || '',
    fare: selectedTrip ? (routes.find(r => r.id === selectedTrip.route_id)?.pickup_points.find(p => p.id === pickupPoint?.id)?.fare || 0) : 0,
    email: undefined,
    onPaymentSuccess: async () => {
      // Payment succeeded - create booking with paid status
      try {
        const result = await createBooking.mutateAsync({
          tripId: selectedTrip!.id,
          seatNumber: selectedSeat!,
          pickupPointId: pickupPoint!.id,
          passengerName: passengerName.trim(),
          passengerPhone: passengerPhone.trim(),
          paymentMethod: selectedPayment,
          fare: selectedTrip ? (routes.find(r => r.id === selectedTrip.route_id)?.pickup_points.find(p => p.id === pickupPoint?.id)?.fare || 0) : 0,
        });

        setBooking({
          id: result.bookingId,
          tripId: selectedTrip!.id,
          seatNumber: selectedSeat!,
          pickupPointId: pickupPoint!.id,
          passengerName: passengerName.trim(),
          passengerPhone: passengerPhone.trim(),
          paymentMethod: selectedPayment,
          paymentStatus: "paid",
          status: "pending",
          fare: selectedTrip ? (routes.find(r => r.id === selectedTrip.route_id)?.pickup_points.find(p => p.id === pickupPoint?.id)?.fare || 0) : 0,
          createdAt: new Date().toISOString(),
        });

        navigate("/eticket");
      } catch (error) {
        toast.error("Gagal membuat booking. Silakan coba lagi.");
        console.error(error);
      }
    },
    onPaymentError: (error) => {
      toast.error(`Pembayaran gagal: ${error.message}`);
      console.error('Payment error:', error);
    },
  });

  if (!selectedTrip || !selectedSeat || !pickupPoint) {
    navigate("/");
    return null;
  }

  const route = routes.find((r) => r.id === selectedTrip.route_id);
  const routePickup = route?.pickup_points.find((p) => p.id === pickupPoint.id);
  const fare = routePickup?.fare ?? 0;
  const pickupTime = routePickup
    ? getPickupTime(selectedTrip.departure_time, routePickup)
    : selectedTrip.departure_time;

  const isNameValid = passengerName.trim().length >= 3;
  const isPhoneValid = /^08\d{8,12}$/.test(passengerPhone.trim());
  const canPay = isNameValid && isPhoneValid && !!selectedPayment;

  // Handle payment button click
  const handlePay = async () => {
    if (!canPay) return;

    setProcessing(true);
    try {
      // Generate Midtrans Snap token
      await payment.generatePaymentToken();
    } catch (error) {
      toast.error("Gagal menghasilkan token pembayaran");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // Auto-process payment when token is available
  useEffect(() => {
    if (payment.snapToken && !payment.isProcessing) {
      payment.processPayment();
    }
  }, [payment.snapToken]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/route")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-lg font-bold italic tracking-tighter uppercase">PYU-GO CHECKOUT</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-pyugo-warning/10 border border-pyugo-warning/20 p-3">
          <AlertCircle size={18} className="text-pyugo-warning shrink-0" />
          <p className="text-xs font-medium text-foreground">
            Be at <span className="font-bold">{pickupPoint.label}</span> by <span className="font-bold text-pyugo-warning">{pickupTime}</span>
          </p>
        </div>

        {payment.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{payment.error.message}</AlertDescription>
          </Alert>
        )}

        {payment.transactionStatus === 'processing' && (
          <Alert>
            <Loader className="h-4 w-4 animate-spin" />
            <AlertDescription>Memproses pembayaran Anda...</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Penumpang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-xs">
                <User size={12} className="text-primary" /> Nama Lengkap
              </Label>
              <Input id="name" placeholder="Masukkan nama lengkap" maxLength={100} value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
              {passengerName.length > 0 && !isNameValid && <p className="text-xs text-destructive">Minimal 3 karakter</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
                <Phone size={12} className="text-primary" /> No. Telepon
              </Label>
              <Input id="phone" placeholder="08xxxxxxxxxx" maxLength={15} value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value.replace(/[^0-9]/g, ""))} inputMode="tel" />
              {passengerPhone.length > 0 && !isPhoneValid && <p className="text-xs text-destructive">Format: 08xxxxxxxxxx (10-14 digit)</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: MapPin, label: "Pickup", value: pickupPoint.label },
              { icon: Clock, label: "Pickup Time", value: pickupTime },
              { icon: Armchair, label: "Seat", value: `#${selectedSeat}` },
              { icon: DollarSign, label: "Fare", value: formatPrice(fare) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                  selectedPayment === method.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", selectedPayment === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <method.icon size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card shadow-lg">
        <div className="mx-auto max-w-md flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">{formatPrice(fare)}</p>
          </div>
          <Button
            onClick={handlePay}
            disabled={!canPay || processing || payment.isLoading || payment.isProcessing}
            className="px-8 h-11 font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {payment.isLoading || payment.isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                {payment.isProcessing ? "Processing..." : "Loading..."}
              </span>
            ) : (
              "Pay Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
