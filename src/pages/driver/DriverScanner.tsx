import { useNavigate } from "react-router-dom";
import { useDriver } from "@/context/DriverContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, QrCode, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const DriverScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookings, updateBookingStatus, isDrivingMode, playFeedback } = useDriver();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<"success" | "failed" | null>(null);

  const simulateScan = () => {
    setScanning(true);
    setScanResult(null);
    
    const pendingBooking = bookings.find(b => b.status === "pending");
    
    setTimeout(() => {
      setScanning(false);
      if (pendingBooking) {
        setScanResult("success");
        updateBookingStatus(pendingBooking.id, "picked_up");
        playFeedback("success");
        
        setTimeout(() => navigate("/driver/pickup"), 1200);
      } else {
        setScanResult("failed");
        playFeedback("error");
      }
    }, 1500);
  };

  useEffect(() => {
    simulateScan();
  }, []);

  return (
    <div className={cn(
      "min-h-screen relative flex flex-col items-center justify-center p-8 transition-colors duration-500",
      isDrivingMode ? "bg-black text-white" : "bg-zinc-900 text-white"
    )}>
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-10">
        <button 
          onClick={() => navigate("/driver/pickup")} 
          className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 border-2 border-white/20"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-[0.3em]">SCANNER</h1>
        <div className="w-16 h-16" />
      </div>

      {/* Giant Scanner Viewport */}
      <div className="relative w-full aspect-square max-w-md rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)]">
        {scanning && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="w-full h-2 bg-primary shadow-[0_0_40px_10px_rgba(59,130,246,0.8)] animate-scan" />
          </div>
        )}

        {scanResult && (
          <div className={cn(
            "absolute inset-0 z-20 flex flex-col items-center justify-center bg-opacity-95 transition-all animate-in fade-in zoom-in-95",
            scanResult === "success" ? "bg-green-600" : "bg-red-600"
          )}>
            {scanResult === "success" ? (
              <>
                <CheckCircle2 size={120} strokeWidth={3} className="mb-6 animate-bounce" />
                <h2 className="text-5xl font-black uppercase tracking-tighter">SUCCESS</h2>
              </>
            ) : (
              <>
                <X size={120} strokeWidth={3} className="mb-6" />
                <h2 className="text-5xl font-black uppercase tracking-tighter">FAILED</h2>
                <Button 
                  variant="outline" 
                  className="mt-10 h-20 px-10 rounded-3xl border-4 border-white text-white text-2xl font-black uppercase"
                  onClick={simulateScan}
                >
                  RETRY
                </Button>
              </>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-zinc-900/50 flex flex-col items-center justify-center">
          <QrCode size={160} strokeWidth={1} className="text-white/5" />
          {scanning && <p className="mt-8 text-primary font-black uppercase tracking-[0.5em] animate-pulse text-xl">Align QR</p>}
        </div>

        {/* Thick Corner Brackets */}
        <div className="absolute top-12 left-12 w-20 h-20 border-t-8 border-l-8 border-primary rounded-tl-3xl" />
        <div className="absolute top-12 right-12 w-20 h-20 border-t-8 border-r-8 border-primary rounded-tr-3xl" />
        <div className="absolute bottom-12 left-12 w-20 h-20 border-b-8 border-l-8 border-primary rounded-bl-3xl" />
        <div className="absolute bottom-12 right-12 w-20 h-20 border-b-8 border-r-8 border-primary rounded-br-3xl" />
      </div>

      <div className="mt-16 text-center max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-6 text-primary">
          <Volume2 size={32} strokeWidth={3} />
          <p className="text-xl font-black uppercase tracking-widest">Audio Guided</p>
        </div>
        <p className="text-2xl font-bold opacity-60 leading-tight">System will beep when scan is complete</p>
      </div>
    </div>
  );
};

export default DriverScanner;
