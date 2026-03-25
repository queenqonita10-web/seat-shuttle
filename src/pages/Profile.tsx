import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, Mail, Phone, MapPin, Camera, LogOut, Shield, Bell, CreditCard, Award, Users
} from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const startEditing = () => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center space-y-3">
          <User size={40} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Silakan login untuk melihat profil</p>
          <Button onClick={() => navigate("/auth")} className="rounded-xl">Login</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary text-primary-foreground pt-12 pb-8 px-5">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full bg-primary-foreground/20" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
              <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const displayProfile = profile ?? { name: "", email: user.email ?? "", phone: "", address: "", avatar_url: "", loyalty_points: 0, total_trips: 0, created_at: "" };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground pt-12 pb-8 px-5">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-primary-foreground/30 overflow-hidden bg-muted">
              <img src={displayProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.name}`} alt={displayProfile.name} className="h-full w-full object-cover" />
            </div>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center border-2 border-primary">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h1 className="text-lg font-bold">{displayProfile.name || user.email}</h1>
            <p className="text-primary-foreground/60 text-xs">Member since {new Date(displayProfile.created_at || Date.now()).getFullYear()}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-primary-foreground/10 text-primary-foreground border-none text-[10px] px-2 py-0.5">
                <Award size={10} className="mr-1" /> {displayProfile.loyalty_points} Pts
              </Badge>
              <Badge className="bg-primary-foreground/10 text-primary-foreground border-none text-[10px] px-2 py-0.5">
                <Users size={10} className="mr-1" /> {displayProfile.total_trips} Trips
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "personal", icon: User, label: "Personal" },
            { id: "security", icon: Shield, label: "Security" },
            { id: "notifications", icon: Bell, label: "Notif" },
            { id: "payments", icon: CreditCard, label: "Payment" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "personal" && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Personal Information</p>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={startEditing} className="text-xs h-8 rounded-lg">Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-xs h-8">Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending} className="text-xs h-8 rounded-lg">
                      {updateProfile.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { key: "name" as const, label: "Full Name", icon: User, value: isEditing ? formData.name : displayProfile.name },
                  { key: "email" as const, label: "Email", icon: Mail, value: isEditing ? formData.email : displayProfile.email },
                  { key: "phone" as const, label: "Phone", icon: Phone, value: isEditing ? formData.phone : displayProfile.phone },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">{field.label}</Label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <Input
                        disabled={!isEditing}
                        value={field.value ?? ""}
                        onChange={e => isEditing && setFormData({ ...formData, [field.key]: e.target.value })}
                        className="pl-9 h-10 rounded-lg bg-muted border-none text-sm"
                      />
                    </div>
                  </div>
                ))}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground" size={14} />
                    <textarea 
                      disabled={!isEditing}
                      value={isEditing ? formData.address : (displayProfile.address ?? "")}
                      onChange={e => isEditing && setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 p-3 min-h-[80px] rounded-lg bg-muted border-none text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-6 text-center space-y-3">
              <Shield size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">Keamanan Akun</p>
              <p className="text-xs text-muted-foreground">Fitur ganti password dan verifikasi 2 langkah akan segera hadir.</p>
              <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
            </CardContent>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-6 text-center space-y-3">
              <Bell size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">Pengaturan Notifikasi</p>
              <p className="text-xs text-muted-foreground">Atur preferensi notifikasi perjalanan dan promo kamu di sini.</p>
              <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
            </CardContent>
          </Card>
        )}

        {activeTab === "payments" && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-6 text-center space-y-3">
              <CreditCard size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">Metode Pembayaran</p>
              <p className="text-xs text-muted-foreground">Tambah dan kelola metode pembayaran untuk checkout lebih cepat.</p>
              <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
            </CardContent>
          </Card>
        )}

        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3 text-destructive text-sm font-semibold">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
