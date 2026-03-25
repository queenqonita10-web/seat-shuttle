import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hash = window.location.hash;

        // Check for valid verification link format
        if (!hash.includes("type=")) {
          setStatus("error");
          setMessage("Link verifikasi tidak valid. Silakan coba lagi.");
          return;
        }

        // Supabase automatically processes URL fragments for verification
        // The onAuthStateChange listener will detect the email change
        // Wait for Supabase to process the token
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Check if session was updated (email verified)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setStatus("error");
          setMessage("Verifikasi email gagal. Silakan coba lagi.");
          return;
        }

        if (data.session?.user) {
          // Email verification successful
          setStatus("success");
          setMessage("Email berhasil diverifikasi!");
          toast.success("Email berhasil diverifikasi!");

          // Redirect to home after 2 seconds
          setTimeout(() => navigate("/", { replace: true }), 2000);
        } else {
          // Session not found after verification
          setStatus("error");
          setMessage("Verifikasi gagal. Silakan login kembali.");
          toast.error("Verifikasi gagal. Silakan login kembali.");

          // Redirect to auth after 2 seconds
          setTimeout(() => navigate("/auth", { replace: true }), 2000);
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
        toast.error("Terjadi kesalahan saat memverifikasi email.");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardContent className="p-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <p className="font-semibold text-base">Memverifikasi Email</p>
              <p className="text-sm text-muted-foreground">
                Harap tunggu sebentar...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                  <Check className="h-10 w-10 text-green-600 relative z-10" />
                </div>
              </div>
              <p className="font-semibold text-base text-green-700">
                {message}
              </p>
              <p className="text-xs text-muted-foreground">
                Mengalihkan ke beranda...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                  <AlertCircle className="h-10 w-10 text-red-600 relative z-10" />
                </div>
              </div>
              <p className="font-semibold text-base text-red-700">{message}</p>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => navigate("/auth", { replace: true })}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  Kembali ke Login
                </button>
                <button
                  onClick={() => navigate("/", { replace: true })}
                  className="w-full px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
