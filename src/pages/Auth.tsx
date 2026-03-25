import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "register" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "driver") navigate("/driver", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login berhasil!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registrasi berhasil! Cek email untuk verifikasi.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Link reset password telah dikirim ke email Anda.");
      setMode("login");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-12 pb-10 px-5 text-center">
        <h1 className="text-2xl font-bold">PYU-GO</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {mode === "login" && "Masuk ke akun Anda"}
          {mode === "register" && "Buat akun baru"}
          {mode === "forgot" && "Reset password"}
        </p>
      </div>

      <div className="flex-1 flex items-start justify-center px-5 -mt-6">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6 space-y-5">
            {mode === "forgot" && (
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={14} /> Kembali ke Login
              </button>
            )}

            <form
              onSubmit={
                mode === "login"
                  ? handleLogin
                  : mode === "register"
                  ? handleRegister
                  : handleForgotPassword
              }
              className="space-y-4"
            >
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="pl-9 h-11 rounded-xl bg-muted border-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="pl-9 h-11 rounded-xl bg-muted border-none"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Password</Label>
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
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline"
                >
                  Lupa password?
                </button>
              )}

              <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" && "Masuk"}
                {mode === "register" && "Daftar"}
                {mode === "forgot" && "Kirim Link Reset"}
              </Button>
            </form>

            {mode !== "forgot" && (
              <p className="text-center text-xs text-muted-foreground">
                {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Daftar" : "Masuk"}
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
