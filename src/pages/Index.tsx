import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { usePickupPoints, useDestinations } from "@/hooks/useRoutes";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Bus, CalendarIcon, MapPin, Navigation, Search } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { setPickupPoint, setDestination, setDate, pickupPoint, destination, date } = useBooking();
  const { data: pickupPoints, isLoading: loadingPickups } = usePickupPoints();
  const { data: destinations, isLoading: loadingDest } = useDestinations();

  const handleSearch = () => {
    if (!pickupPoint || !destination || !date) return;
    navigate("/search");
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Hero */}
      <div className="bg-primary px-5 pb-10 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <div className="mb-1 flex items-center gap-2">
            <div className="bg-white text-primary p-1.5 rounded-lg shadow-inner">
              <Bus size={24} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">PYU-GO</h1>
          </div>
          <p className="text-sm text-primary-foreground/80 font-medium tracking-tight">Your Premium Ride. Smart & Reliable.</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="mx-auto max-w-md px-5 -mt-6">
        <Card className="shadow-lg border-0 animate-fade-up">
          <CardContent className="p-5 space-y-4">
            {/* Pickup Point */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin size={12} />
                Pickup Point
              </label>
              {loadingPickups ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select
                  value={pickupPoint?.id ?? ""}
                  onValueChange={(val) => {
                    const found = pickupPoints?.find((p) => p.id === val);
                    if (found) setPickupPoint(found);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup point" />
                  </SelectTrigger>
                  <SelectContent>
                    {(pickupPoints ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Navigation size={12} />
                Destination
              </label>
              {loadingDest ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where are you going?" />
                  </SelectTrigger>
                  <SelectContent>
                    {(destinations ?? []).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon size={12} />
                Travel Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ?? undefined}
                    onSelect={(d) => setDate(d ?? null)}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* CTA */}
            <Button
              onClick={handleSearch}
              className="w-full h-12 text-base font-semibold gap-2"
              disabled={!pickupPoint || !destination || !date}
            >
              <Search size={18} />
              Search Tickets
            </Button>
          </CardContent>
        </Card>

        {/* Quick info */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "🚌", label: "17 Stops" },
            { icon: "💺", label: "Comfy Seats" },
            { icon: "📍", label: "Live Track" },
          ].map((item) => (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
