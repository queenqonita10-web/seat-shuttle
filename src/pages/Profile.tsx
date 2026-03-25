import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  LogOut, 
  Shield, 
  Bell, 
  CreditCard,
  ChevronRight,
  Save,
  Award,
  Users
} from "lucide-react";
import { currentUser } from "@/data/mockData";
import { toast } from "sonner";

export default function Profile() {
  const [profile, setProfile] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profil berhasil diperbarui!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header Profile */}
      <div className="bg-zinc-900 text-white pt-16 pb-32 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-primary overflow-hidden shadow-2xl bg-white">
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-zinc-900 hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-1">{profile.name}</h1>
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">Member Since {new Date(profile.memberSince).getFullYear()}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none py-2 px-4 rounded-xl">
                <Award size={14} className="mr-2 text-primary" /> {profile.loyaltyPoints} Points
              </Badge>
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none py-2 px-4 rounded-xl">
                <Users size={14} className="mr-2 text-primary" /> {profile.totalTrips} Trips
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Settings */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {[
                    { icon: User, label: "Personal Info", active: true },
                    { icon: Shield, label: "Security", active: false },
                    { icon: Bell, label: "Notifications", active: false },
                    { icon: CreditCard, label: "Payments", active: false },
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest",
                        item.active ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-zinc-100 text-zinc-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} />
                        {item.label}
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-widest mt-4">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="border-b border-zinc-50 flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="text-xl font-black uppercase italic tracking-tight">Personal Information</CardTitle>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage your details</p>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="font-black text-[10px] uppercase tracking-widest rounded-xl border-2">Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</Button>
                    <Button onClick={handleSave} className="font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Save</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                        disabled={!isEditing} 
                        value={profile.name} 
                        onChange={e => setProfile({...profile, name: e.target.value})}
                        className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none shadow-inner font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                        disabled={!isEditing} 
                        value={profile.email} 
                        onChange={e => setProfile({...profile, email: e.target.value})}
                        className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none shadow-inner font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                        disabled={!isEditing} 
                        value={profile.phone} 
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none shadow-inner font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loyalty ID</Label>
                    <div className="relative">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-200" size={18} />
                      <Input 
                        disabled 
                        value={profile.id} 
                        className="pl-12 h-14 rounded-2xl bg-zinc-100 border-none text-zinc-400 font-mono font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Home Address</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                    <textarea 
                      disabled={!isEditing}
                      value={profile.address}
                      onChange={e => setProfile({...profile, address: e.target.value})}
                      className="w-full pl-12 p-4 min-h-[100px] rounded-2xl bg-zinc-50 border-none shadow-inner font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
