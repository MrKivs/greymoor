import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, DollarSign, CreditCard } from "lucide-react";

type BookingRow = {
  id: string;
  booking_ref: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_nights: number;
  grand_total: number;
  status: string;
  created_at: string;
  customer_id: string;
  room_id: string;
  rooms: { room_number: string; room_type: string } | null;
};

type Profile = { id: string; full_name: string; email: string };

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  checked_in: "bg-green-500/20 text-green-400 border-green-500/30",
  checked_out:"bg-muted/40 text-muted-foreground border-border",
  cancelled:  "bg-destructive/20 text-destructive border-destructive/30",
};

const STATUS_OPTIONS = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
const PAYMENT_METHODS = ["cash", "mpesa", "card", "bank_transfer"];

const BookingsPage = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  // Payment dialog state
  const [payDlgOpen, setPayDlgOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    booking_id: "", booking_ref: "", amount: 0,
    payment_method: "cash" as "cash" | "mpesa" | "card" | "bank_transfer",
    transaction_ref: "",
  });

  // Bookings + room join
  const { data: rawBookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_ref, check_in, check_out, guests_count, total_nights, grand_total, status, created_at, customer_id, room_id, rooms(room_number, room_type)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingRow[];
    },
  });

  // Profiles lookup
  const customerIds = useMemo(() => [...new Set(rawBookings.map((b) => b.customer_id))], [rawBookings]);
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-booking-profiles", customerIds],
    queryFn: async () => {
      if (customerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles").select("id, full_name, email").in("id", customerIds);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: customerIds.length > 0,
  });

  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const bookings = useMemo(
    () => rawBookings.map((b) => ({ ...b, profile: profileMap[b.customer_id] ?? null })),
    [rawBookings, profileMap]
  );

  // ── Booking status update + room sync ──────────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, roomId }: { id: string; status: string; roomId?: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: status as "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" })
        .eq("id", id);
      if (error) throw error;

      if (roomId) {
        let roomStatus: "available" | "occupied" | "maintenance" | null = null;
        if (status === "checked_in")                            roomStatus = "occupied";
        if (status === "checked_out" || status === "cancelled") roomStatus = "available";
        if (status === "confirmed"   || status === "pending")   roomStatus = "available";
        if (roomStatus) {
          await supabase.from("rooms").update({ status: roomStatus }).eq("id", roomId);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      toast.success("Booking updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Record payment directly from booking row ───────────────────────────────
  const recordPayment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert([{
        booking_id: payForm.booking_id,
        amount: payForm.amount,
        payment_method: payForm.payment_method,
        transaction_ref: payForm.transaction_ref || null,
        status: "completed",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      setPayDlgOpen(false);
      toast.success("Payment recorded successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openPayDialog = (b: typeof bookings[0]) => {
    setPayForm({
      booking_id: b.id,
      booking_ref: b.booking_ref,
      amount: Number(b.grand_total),
      payment_method: "cash",
      transaction_ref: "",
    });
    setPayDlgOpen(true);
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const totalRevenue = bookings
    .filter((b) => ["confirmed", "checked_in", "checked_out"].includes(b.status))
    .reduce((s, b) => s + Number(b.grand_total), 0);

  return (
    <AdminShell title="Bookings Management" backHref="/admin/dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 sm:col-span-2">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-display font-semibold">KES {totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-body">Confirmed Revenue</p>
            </div>
          </div>
        </div>
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Pending",        value: bookings.filter((b) => b.status === "pending").length },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className="text-3xl font-display font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <CalendarDays className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-body text-muted-foreground">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-xl">No bookings found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground font-body text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Ref</th>
                  <th className="text-left p-4">Guest</th>
                  <th className="text-left p-4">Room</th>
                  <th className="text-left p-4">Check-in</th>
                  <th className="text-left p-4">Check-out</th>
                  <th className="text-left p-4">Nights</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-body text-xs text-muted-foreground">{b.booking_ref}</td>
                    <td className="p-4">
                      <p className="font-body font-medium">{b.profile?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.profile?.email}</p>
                    </td>
                    <td className="p-4 font-body text-muted-foreground capitalize">
                      Rm {b.rooms?.room_number} · {b.rooms?.room_type}
                    </td>
                    <td className="p-4 font-body text-muted-foreground">{b.check_in}</td>
                    <td className="p-4 font-body text-muted-foreground">{b.check_out}</td>
                    <td className="p-4 font-display font-semibold">{b.total_nights}</td>
                    <td className="p-4 font-display font-semibold">
                      KES {Number(b.grand_total).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge className={`${STATUS_COLORS[b.status] ?? ""} border text-[10px] capitalize`}>
                        {b.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status update */}
                        <Select
                          value={b.status}
                          onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v, roomId: b.room_id })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">
                                {s.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Quick-confirm payment */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                          onClick={() => openPayDialog(b)}
                          title="Record payment for this booking"
                        >
                          <CreditCard className="w-3 h-3" /> Pay
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Confirm Payment Dialog ── */}
      <Dialog open={payDlgOpen} onOpenChange={setPayDlgOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card p-3 text-sm font-body text-muted-foreground">
              Booking: <span className="text-foreground font-semibold">{payForm.booking_ref}</span>
            </div>
            <div>
              <Label>Amount (KES) <span className="text-muted-foreground text-[10px] ml-1">— pre-filled from booking total</span></Label>
              <Input
                type="number"
                min={0}
                value={payForm.amount}
                onChange={(e) => setPayForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={payForm.payment_method}
                onValueChange={(v) => setPayForm(f => ({ ...f, payment_method: v as typeof payForm.payment_method }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">{m.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction Reference <span className="text-muted-foreground text-[10px] ml-1">(optional)</span></Label>
              <Input
                placeholder="e.g. M-Pesa code"
                value={payForm.transaction_ref}
                onChange={(e) => setPayForm(f => ({ ...f, transaction_ref: e.target.value }))}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => recordPayment.mutate()}
              disabled={payForm.amount <= 0 || recordPayment.isPending}
            >
              {recordPayment.isPending ? "Recording…" : `Confirm Payment — KES ${payForm.amount.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default BookingsPage;
