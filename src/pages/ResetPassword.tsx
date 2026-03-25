import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      toast.error("Link reset tidak valid.");
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password berhasil diubah!");
      navigate("/", { replace: true });
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-lg font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Masukkan password baru Anda</p>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="pl-9 h-11 rounded-xl bg-muted border-none"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
