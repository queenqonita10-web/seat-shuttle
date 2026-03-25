import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Phone, MapPin, Camera, LogOut, Shield, Bell, CreditCard, Save, Award, Users
} from "lucide-react";
import { currentUser } from "@/data/mockData";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

export default function Profile() {
  const [profile, setProfile] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profil berhasil diperbarui!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-12 pb-8 px-5">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-primary-foreground/30 overflow-hidden bg-muted">
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            </div>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center border-2 border-primary">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h1 className="text-lg font-bold">{profile.name}</h1>
            <p className="text-primary-foreground/60 text-xs">Member since {new Date(profile.memberSince).getFullYear()}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-primary-foreground/10 text-primary-foreground border-none text-[10px] px-2 py-0.5">
                <Award size={10} className="mr-1" /> {profile.loyaltyPoints} Pts
              </Badge>
              <Badge className="bg-primary-foreground/10 text-primary-foreground border-none text-[10px] px-2 py-0.5">
                <Users size={10} className="mr-1" /> {profile.totalTrips} Trips
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-4 space-y-4">
        {/* Tab Pills */}
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
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal Info Form */}
        {activeTab === "personal" && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Personal Information</p>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs h-8 rounded-lg">Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-xs h-8">Cancel</Button>
                    <Button size="sm" onClick={handleSave} className="text-xs h-8 rounded-lg">Save</Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input disabled={!isEditing} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="pl-9 h-10 rounded-lg bg-muted border-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input disabled={!isEditing} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="pl-9 h-10 rounded-lg bg-muted border-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input disabled={!isEditing} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="pl-9 h-10 rounded-lg bg-muted border-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Loyalty ID</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input disabled value={profile.id} className="pl-9 h-10 rounded-lg bg-muted border-none text-sm font-mono text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground" size={14} />
                    <textarea 
                      disabled={!isEditing}
                      value={profile.address}
                      onChange={e => setProfile({...profile, address: e.target.value})}
                      className="w-full pl-9 p-3 min-h-[80px] rounded-lg bg-muted border-none text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
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

        {/* Notifications Tab */}
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

        {/* Payment Tab */}
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

        {/* Sign Out */}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-destructive text-sm font-semibold">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
