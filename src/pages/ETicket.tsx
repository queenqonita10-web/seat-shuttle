import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useRoutes } from "@/hooks/useRoutes";
import { formatPrice, getPickupTime } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Armchair, Clock, CheckCircle, QrCode, Navigation, User, Phone, Download, Share2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ETicket() {
  const navigate = useNavigate();
  const { booking, selectedTrip, pickupPoint } = useBooking();
  const { data: routes = [] } = useRoutes();
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booking) {
      navigate("/", { replace: true });
    }
  }, [booking, navigate]);

  const handleDownloadQR = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector("svg");
      if (svg) {
        // Convert SVG to PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `ticket-${booking?.id}.png`;
          link.click();
        };
        
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };

  const handleShare = async () => {
    const shareText = `Check my PYU-GO ticket!\nBooking: ${booking?.id}\nTrip: ${selectedTrip?.id}\nSeat: ${booking?.seatNumber}`;
    if (navigator.share) {
      await navigator.share({
        title: "PYU-GO Ticket",
        text: shareText,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
    }
  };

  if (!booking) return null;

  const route = selectedTrip ? routes.find((r) => r.id === selectedTrip.route_id) : null;
  const routePickup = route?.pickup_points.find((p) => p.id === booking.pickupPointId);
  const pickupTime = selectedTrip && routePickup
    ? getPickupTime(selectedTrip.departure_time, routePickup)
    : "";
  const fare = booking.fare ?? routePickup?.fare ?? 0;

  // Generate QR data: contains ticket ID, booking ID, and seat info for verification
  const qrData = JSON.stringify({
    ticketId: booking.id,
    bookingId: booking.id,
    seat: booking.seatNumber,
    trip: selectedTrip?.id,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-5 pb-8 pt-12 text-primary-foreground text-center">
        <div className="mx-auto max-w-md">
          <CheckCircle size={48} className="mx-auto mb-2" />
          <h1 className="text-xl font-bold italic tracking-tighter uppercase">PYU-GO CONFIRMED!</h1>
          <p className="text-sm text-primary-foreground/80">Your e-ticket is ready</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 -mt-4 space-y-4">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-primary/5 p-4 text-center border-b border-dashed">
            <Badge className="bg-secondary text-secondary-foreground mb-2">
              <CheckCircle size={12} className="mr-1" /> Paid
            </Badge>
            <p className="text-xs text-muted-foreground font-mono mt-1">{booking.id}</p>
          </div>

          <CardContent className="p-5 space-y-4">
            <div ref={qrRef} className="mx-auto h-40 w-40 rounded-xl bg-white border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 p-2">
              <QRCodeSVG
                value={qrData}
                size={128}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <User size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Penumpang</p>
                  <p className="text-sm font-medium">{booking.passengerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">No. Telepon</p>
                  <p className="text-sm font-medium">{booking.passengerPhone}</p>
                </div>
              </div>
              {route && (
                <div className="flex items-center gap-3">
                  <Navigation size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="text-sm font-medium">{route.name} → {route.destination}</p>
                  </div>
                </div>
              )}
              {pickupPoint && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Point</p>
                    <p className="text-sm font-medium">{pickupPoint.label}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Time</p>
                  <p className="text-sm font-medium">{pickupTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Armchair size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Seat Number</p>
                  <p className="text-sm font-medium">#{booking.seatNumber}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t text-right">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-primary">{formatPrice(fare)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button onClick={() => navigate("/track")} className="w-full h-11 font-semibold">
            Track Driver
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleDownloadQR} variant="outline" className="flex-1 h-11">
              <Download size={16} className="mr-2" /> Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 h-11">
              <Share2 size={16} className="mr-2" /> Share
            </Button>
          </div>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full h-11">
            Back to Home
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
