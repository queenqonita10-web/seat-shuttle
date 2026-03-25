import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerTab, setRegisterTab] = useState<"email" | "methods">("methods");
  const [registerRole, setRegisterRole] = useState<"passenger" | "driver" | null>(null);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "driver") navigate("/driver", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  // ========== LOGIN HANDLERS ==========

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error("Email dan password harus diisi");
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      toast.success("Login berhasil!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTER HANDLERS ==========

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!registerEmail || !registerPassword || !registerName) {
        throw new Error("Email, password, dan nama harus diisi");
      }

      if (registerPassword !== registerPasswordConfirm) {
        throw new Error("Password tidak cocok");
      }

      if (registerPassword.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      if (!registerRole) {
        throw new Error("Pilih tipe pengguna (Penumpang/Driver)");
      }

      // Sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            name: registerName,
            phone: registerPhone,
            role: registerRole,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Signup gagal");

      // Assign role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: registerRole,
        });

      if (roleError && !roleError.message.includes("duplicate")) throw roleError;

      // Auto-login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: registerEmail,
        password: registerPassword,
      });

      if (loginError) throw loginError;

      toast.success(`Selamat datang, ${registerName}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registrasi gagal";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ========== DEMO ACCOUNTS ==========

  const handleDemoLogin = async (demoRole: "admin" | "driver" | "passenger") => {
    const demoAccounts: Record<string, { email: string; password: string; role: string }> = {
      admin: { email: "admin@pyugo.test", password: "admin123456", role: "Admin" },
      driver: { email: "driver@pyugo.test", password: "driver123456", role: "Driver" },
      passenger: { email: "passenger@pyugo.test", password: "passenger123456", role: "Penumpang" },
    };

    const account = demoAccounts[demoRole];
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (authError) {
        // Try to create demo account if not exists
        if (authError.message.includes("Invalid login credentials")) {
          const { data: createData, error: createError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              data: {
                name: `Demo ${account.role}`,
                phone: "0812345678",
                role: demoRole,
              },
            },
          });

          if (createError) throw createError;
          if (!createData.user) throw new Error("Demo account creation failed");

          // Assign role
          await supabase.from("user_roles").insert({
            user_id: createData.user.id,
            role: demoRole,
          });

          // Auto-login
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password,
          });

          if (loginError) throw loginError;
        } else {
          throw authError;
        }
      }

      toast.success(`Demo login sebagai ${account.role}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Demo login gagal";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PYU-GO
          </CardTitle>
          <CardDescription>Layanan Shuttle Terpercaya</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            {/* ========== LOGIN TAB ========== */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">atau gunakan demo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Admin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("driver")}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Driver"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("passenger")}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Penumpang"}
                </Button>
              </div>
            </TabsContent>

            {/* ========== REGISTER TAB ========== */}
            <TabsContent value="register" className="space-y-4">
              {registerTab === "methods" ? (
                // SELECT ROLE
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Pilih Tipe Pengguna</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center text-base"
                    onClick={() => {
                      setRegisterRole("passenger");
                      setRegisterTab("email");
                    }}
                  >
                    <span className="text-2xl mb-2">👤</span>
                    Penumpang
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center text-base"
                    onClick={() => {
                      setRegisterRole("driver");
                      setRegisterTab("email");
                    }}
                  >
                    <span className="text-2xl mb-2">🚗</span>
                    Driver
                  </Button>
                </div>
              ) : (
                // REGISTRATION FORM
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <Input
                      id="register-name"
                      placeholder="Nama Anda"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {registerRole === "driver" && (
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Nomor HP</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm">Konfirmasi Password</Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      placeholder="Ulangi password"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRegisterTab("methods");
                        setRegisterRole(null);
                      }}
                      disabled={loading}
                    >
                      Kembali
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Daftar
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
