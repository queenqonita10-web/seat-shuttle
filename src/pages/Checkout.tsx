import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { routes, formatPrice, getPickupTime } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Wallet, QrCode, MapPin, Armchair, Clock, DollarSign, AlertCircle, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { id: "ewallet", label: "E-Wallet", icon: Wallet, description: "GoPay, OVO, Dana" },
  { id: "bank", label: "Bank Transfer", icon: CreditCard, description: "BCA, Mandiri, BNI" },
  { id: "qr", label: "QRIS", icon: QrCode, description: "Scan to pay" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, pickupPoint, passengerName, passengerPhone, setPassengerName, setPassengerPhone, setBooking } = useBooking();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!selectedTrip || !selectedSeat || !pickupPoint) {
    navigate("/");
    return null;
  }

  const route = routes.find((r) => r.id === selectedTrip.routeId);
  const routePickup = route?.pickupPoints.find((p) => p.id === pickupPoint.id);
  const fare = routePickup?.fare ?? 0;
  const pickupTime = routePickup
    ? getPickupTime(selectedTrip.departureTime, routePickup)
    : selectedTrip.departureTime;

  const isNameValid = passengerName.trim().length >= 3;
  const isPhoneValid = /^08\d{8,12}$/.test(passengerPhone.trim());
  const canPay = isNameValid && isPhoneValid && !!selectedPayment;

  const handlePay = () => {
    if (!canPay) return;
    setProcessing(true);
    setTimeout(() => {
      setBooking({
        id: `BK-${Date.now()}`,
        tripId: selectedTrip.id,
        seatNumber: selectedSeat,
        pickupPointId: pickupPoint.id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        paymentMethod: selectedPayment,
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      });
      navigate("/eticket");
    }, 1500);
  };

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
        {/* Boarding reminder */}
        <div className="flex items-center gap-3 rounded-lg bg-pyugo-warning/10 border border-pyugo-warning/20 p-3">
          <AlertCircle size={18} className="text-pyugo-warning shrink-0" />
          <p className="text-xs font-medium text-foreground">
            Be at <span className="font-bold">{pickupPoint.label}</span> by <span className="font-bold text-pyugo-warning">{pickupTime}</span>
          </p>
        </div>

        {/* Passenger Biodata */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Penumpang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-xs">
                <User size={12} className="text-primary" /> Nama Lengkap
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                maxLength={100}
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
              />
              {passengerName.length > 0 && !isNameValid && (
                <p className="text-xs text-destructive">Minimal 3 karakter</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
                <Phone size={12} className="text-primary" /> No. Telepon
              </Label>
              <Input
                id="phone"
                placeholder="08xxxxxxxxxx"
                maxLength={15}
                value={passengerPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPassengerPhone(val);
                }}
                inputMode="tel"
              />
              {passengerPhone.length > 0 && !isPhoneValid && (
                <p className="text-xs text-destructive">Format: 08xxxxxxxxxx (10-14 digit)</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
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

        {/* Payment */}
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
                  selectedPayment === method.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  selectedPayment === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
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
            disabled={!canPay || processing}
            className="px-8 h-11 font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {processing ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
