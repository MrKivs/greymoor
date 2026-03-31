import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NumberMorph from "@/components/animations/NumberMorph";
import GuestRequestPanel from "@/components/guest/GuestRequestPanel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GuestDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  // Real booking stats
  const { data: bookings = [] } = useQuery({
    queryKey: ["guest-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("customer_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: customerData } = useQuery({
    queryKey: ["guest-customer", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("loyalty_points, total_stays")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeBookings = bookings.filter((b) =>
    ["confirmed", "checked_in", "pending"].includes(b.status)
  ).length;

  return (
    <div className="min-h-screen bg-background grain-overlay">
      {/* Header */}
      <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">
            Grey<span className="text-primary">moor</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-body">{profile?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="glass-card p-8 mb-8">
          <h2 className="font-display text-3xl font-light mb-2">
            Welcome back, <span className="text-gradient-gold">{profile?.full_name || "Guest"}</span>
          </h2>
          <p className="text-muted-foreground font-body">Manage your bookings and explore new adventures.</p>
        </div>

        {/* Quick stats with real data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Calendar, label: "Active Bookings",  value: activeBookings },
            { icon: Star,     label: "Loyalty Points",   value: customerData?.loyalty_points ?? 0 },
            { icon: User,     label: "Total Stays",      value: customerData?.total_stays ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <NumberMorph
                  value={stat.value}
                  className="text-2xl font-display font-semibold block"
                />
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bookings */}
          <div className="glass-card p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">
              {activeBookings > 0 ? `${activeBookings} Active Booking${activeBookings > 1 ? "s" : ""}` : "No Bookings Yet"}
            </h3>
            <p className="text-muted-foreground font-body text-sm mb-6">
              {activeBookings > 0
                ? "Your upcoming stays are confirmed."
                : "Start planning your dream safari getaway."}
            </p>
            <Button variant="hero" onClick={() => navigate("/book")}>
              Browse Rooms &amp; Safaris
            </Button>
          </div>

          {/* Room Services Panel */}
          <div className="glass-card p-6">
            <GuestRequestPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
