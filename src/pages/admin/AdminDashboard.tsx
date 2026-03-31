import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Bed, Map, Users, CreditCard, TrendingUp, Bell, DollarSign,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Live KPI data
  const { data: rooms = [] } = useQuery({
    queryKey: ["dash-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("status");
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["dash-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("grand_total, status, created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["dash-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("amount, status, created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: profileCount = [] } = useQuery({
    queryKey: ["dash-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, created_at");
      if (error) throw error;
      return data;
    },
  });

  // KPI calculations
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const monthlyRevenue = payments
    .filter((p) => p.status === "completed" && p.created_at >= monthStart)
    .reduce((s, p) => s + Number(p.amount), 0);

  const totalRooms = rooms.length || 1;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const activeSafarBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "checked_in"
  ).length;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const newGuests = profileCount.filter((p) => p.created_at >= weekAgo).length;

  const kpis = [
    {
      icon: DollarSign,
      label: "Revenue This Month",
      value: `KES ${monthlyRevenue.toLocaleString()}`,
    },
    { icon: Bed, label: "Occupancy Rate", value: `${occupancyRate}%` },
    { icon: Map, label: "Active Bookings", value: String(activeSafarBookings) },
    { icon: Users, label: "New Guests This Week", value: String(newGuests) },
  ];

  const navItems = [
    { icon: Bed, label: "Rooms", href: "/admin/rooms" },
    { icon: Map, label: "Safaris", href: "/admin/safaris" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: CreditCard, label: "Bookings", href: "/admin/bookings" },
    { icon: DollarSign, label: "Payments", href: "/admin/payments" },
    { icon: TrendingUp, label: "Pricing Engine", href: "/admin/pricing" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  ];

  return (
    <AdminShell title="Admin Dashboard">
      <h2 className="font-display text-3xl font-light mb-8">Admin Control Panel</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <stat.icon className="w-8 h-8 text-primary mb-3" />
            <p className="text-2xl font-display font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Navigation grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            className="glass-card-hover p-6 text-center group transition-all duration-300"
          >
            <item.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
            <p className="text-sm font-body text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
