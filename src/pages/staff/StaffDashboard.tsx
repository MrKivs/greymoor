import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Users, CalendarCheck, DoorOpen, Wrench, SprayCan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StaffDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Current guests — bookings with status 'checked_in'
  const { data: currentGuests = 0 } = useQuery({
    queryKey: ["staff-current-guests"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "checked_in");
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Today's arrivals — confirmed bookings checking in today
  const { data: todayArrivals = 0 } = useQuery({
    queryKey: ["staff-today-arrivals"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("check_in", today)
        .in("status", ["confirmed", "checked_in"]);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Today's departures — checked_in bookings checking out today
  const { data: todayDepartures = 0 } = useQuery({
    queryKey: ["staff-today-departures"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("check_out", today)
        .eq("status", "checked_in");
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Open maintenance requests
  const { data: openMaintenance = 0 } = useQuery({
    queryKey: ["staff-open-maintenance"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["reported", "assigned", "in_progress"]);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const stats = [
    { icon: CalendarCheck, label: "Today's Arrivals",   value: todayArrivals,   color: "text-green-400" },
    { icon: DoorOpen,      label: "Today's Departures", value: todayDepartures, color: "text-primary" },
    { icon: Users,         label: "Current Guests",     value: currentGuests,   color: "text-primary" },
    { icon: Wrench,        label: "Open Maintenance",   value: openMaintenance, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold">
            Grey<span className="text-primary">moor</span>
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-body">Staff</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-body">{profile?.full_name}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <h2 className="font-display text-3xl font-light mb-8">Staff Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <p className="text-3xl font-display font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate("/staff/housekeeping")}
            className="glass-card-hover p-8 text-left group"
          >
            <SprayCan className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-xl mb-1">Housekeeping</h3>
            <p className="text-sm text-muted-foreground font-body">
              Manage cleaning tasks, guest requests, and maintenance issues.
            </p>
          </button>

          <div className="glass-card p-8 text-left opacity-60">
            <Users className="w-10 h-10 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl mb-1">Guest Management</h3>
            <p className="text-sm text-muted-foreground font-body">
              Coming soon — manage check-ins, reservations, and guest profiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

