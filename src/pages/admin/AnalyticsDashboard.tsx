import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, BedDouble, CalendarDays, XCircle, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import NumberMorph from "@/components/animations/NumberMorph";

const COLORS = ["hsl(34,55%,51%)", "hsl(120,24%,23%)", "hsl(40,55%,58%)", "hsl(0,72%,51%)", "hsl(200,50%,50%)"];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  const { data: bookings = [] } = useQuery({
    queryKey: ["analytics-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["analytics-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["analytics-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*");
      if (error) throw error;
      return data;
    },
  });

  // KPI calculations
  const totalRooms = rooms.length || 1;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const confirmedBookings = bookings.filter((b) => ["confirmed", "checked_in", "checked_out"].includes(b.status));
  const adr = confirmedBookings.length > 0
    ? Math.round(confirmedBookings.reduce((s, b) => s + Number(b.room_subtotal), 0) / confirmedBookings.length)
    : 0;

  const totalNights = confirmedBookings.reduce((s, b) => s + b.total_nights, 0);
  const revpar = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;

  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const cancellationRate = bookings.length > 0 ? Math.round((cancelledCount / bookings.length) * 100) : 0;

  // Booking lead time (days between created_at and check_in)
  const leadTimes = confirmedBookings.map((b) => {
    const created = new Date(b.created_at).getTime();
    const checkin = new Date(b.check_in).getTime();
    return Math.max(0, Math.round((checkin - created) / (1000 * 60 * 60 * 24)));
  });
  const avgLeadTime = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : 0;

  // Monthly revenue chart
  const monthlyRevenue = completedPayments.reduce((acc, p) => {
    const month = new Date(p.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
    acc[month] = (acc[month] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);
  const revenueChartData = Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }));

  // Booking status distribution
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Room type distribution
  const roomTypeCounts = rooms.reduce((acc, r) => {
    acc[r.room_type] = (acc[r.room_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const roomTypeData = Object.entries(roomTypeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border/30 px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="font-display text-xl font-semibold">Analytics & Intelligence</h1>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: DollarSign, label: "Total Revenue", value: totalRevenue, prefix: "$" },
            { icon: BedDouble, label: "Occupancy", value: occupancyRate, suffix: "%" },
            { icon: TrendingUp, label: "RevPAR", value: revpar, prefix: "$" },
            { icon: TrendingUp, label: "ADR", value: adr, prefix: "$" },
            { icon: CalendarDays, label: "Avg Lead Time", value: avgLeadTime, suffix: "d" },
            { icon: XCircle, label: "Cancel Rate", value: cancellationRate, suffix: "%" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card p-4 text-center">
              <kpi.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-display font-semibold">
                {kpi.prefix}
                <NumberMorph value={kpi.value} className="inline" />
                {kpi.suffix}
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue trend */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg mb-4">Revenue Trend</h3>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(34,55%,51%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(34,55%,51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "hsl(36,15%,60%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(36,15%,60%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(60,4%,13%)", border: "1px solid hsl(60,5%,25%)", borderRadius: 8, color: "hsl(36,38%,93%)" }} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(34,55%,51%)" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground font-body text-sm">No payment data yet</div>
            )}
          </div>

          {/* Booking status */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg mb-4">Booking Status Distribution</h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(60,4%,13%)", border: "1px solid hsl(60,5%,25%)", borderRadius: 8, color: "hsl(36,38%,93%)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground font-body text-sm">No booking data yet</div>
            )}
          </div>
        </div>

        {/* Room type breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display text-lg mb-4">Room Inventory by Type</h3>
          {roomTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roomTypeData}>
                <XAxis dataKey="name" tick={{ fill: "hsl(36,15%,60%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(36,15%,60%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(60,4%,13%)", border: "1px solid hsl(60,5%,25%)", borderRadius: 8, color: "hsl(36,38%,93%)" }} />
                <Bar dataKey="value" fill="hsl(120,24%,23%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground font-body text-sm">No room data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
