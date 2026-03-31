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
import { Plus, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: "cash" | "mpesa" | "card" | "bank_transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  receipt_number: string;
  transaction_ref: string | null;
  created_at: string;
  bookings?: { booking_ref: string; customer_id: string } | null;
};

type BookingOption = { id: string; booking_ref: string; customer_id: string; grand_total: number };
type Profile = { id: string; full_name: string };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
  refunded: "bg-muted/40 text-muted-foreground border-border",
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  failed: XCircle,
  pending: Clock,
  refunded: Clock,
};

const PAYMENT_METHODS = ["cash", "mpesa", "card", "bank_transfer"];

const EMPTY_FORM = {
  booking_id: "",
  amount: 0,
  payment_method: "cash" as Payment["payment_method"],
  transaction_ref: "",
};

const PaymentsPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);

  // payments — only join bookings (valid FK), not profiles
  const { data: rawPayments = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, booking_id, amount, payment_method, status, receipt_number, transaction_ref, created_at, bookings(booking_ref, customer_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });

  // bookings for the dialog dropdown — no profiles join
  const { data: bookingOptions = [] } = useQuery({
    queryKey: ["admin-bookings-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_ref, customer_id, grand_total")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingOption[];
    },
  });

  // fetch profiles for customer_ids found in payments + bookingOptions
  const customerIds = useMemo(() => {
    const ids = new Set<string>();
    rawPayments.forEach((p) => { if (p.bookings?.customer_id) ids.add(p.bookings.customer_id); });
    bookingOptions.forEach((b) => ids.add(b.customer_id));
    return [...ids];
  }, [rawPayments, bookingOptions]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-payment-profiles", customerIds],
    queryFn: async () => {
      if (customerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: customerIds.length > 0,
  });

  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);

  const payments = useMemo(
    () => rawPayments.map((p) => ({
      ...p,
      guestName: p.bookings?.customer_id ? (profileMap[p.bookings.customer_id]?.full_name ?? "—") : "—",
    })),
    [rawPayments, profileMap]
  );

  const bookings = useMemo(
    () => bookingOptions.map((b) => ({ ...b, guestName: profileMap[b.customer_id]?.full_name ?? "Guest" })),
    [bookingOptions, profileMap]
  );

  const record = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert([{
        booking_id: form.booking_id,
        amount: form.amount,
        payment_method: form.payment_method,
        transaction_ref: form.transaction_ref || null,
        status: "completed",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      setOpen(false);
      setForm(EMPTY_FORM);
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Pre-fill the form with a booking's full amount for quick confirm
  const quickFill = (bookingId: string, method: Payment["payment_method"] = "cash") => {
    const b = bookingOptions.find(b => b.id === bookingId);
    if (!b) return;
    setForm({ booking_id: b.id, amount: Number(b.grand_total), payment_method: method, transaction_ref: "" });
    setOpen(true);
  };

  // Auto-fill amount when booking is selected in the dialog
  const handleBookingSelect = (bookingId: string) => {
    const b = bookingOptions.find(b => b.id === bookingId);
    setForm(f => ({ ...f, booking_id: bookingId, amount: b ? Number(b.grand_total) : f.amount }));
  };

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <AdminShell
      title="Payments"
      backHref="/admin/dashboard"
      action={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Record Payment
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 sm:col-span-2">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-display font-semibold">
                KES {totalCompleted.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-body">Total Collected</p>
            </div>
          </div>
        </div>
        {[
          { label: "Total Transactions", value: payments.length },
          { label: "Pending", value: payments.filter((p) => p.status === "pending").length },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className="text-3xl font-display font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-body text-muted-foreground">Filter:</span>
        {["all", "completed", "pending", "failed", "refunded"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading payments…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-xl">No payments found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground font-body text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Receipt</th>
                  <th className="text-left p-4">Booking</th>
                  <th className="text-left p-4">Guest</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map((p) => {
                  const Icon = STATUS_ICONS[p.status] ?? Clock;
                  return (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-body text-xs text-muted-foreground">{p.receipt_number}</td>
                      <td className="p-4 font-body text-muted-foreground">
                        {p.bookings?.booking_ref ?? "—"}
                      </td>
                      <td className="p-4 font-body">
                        {p.guestName}
                      </td>
                      <td className="p-4 font-display font-semibold">
                        KES {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="p-4 font-body text-muted-foreground capitalize">
                        {p.payment_method.replace("_", " ")}
                      </td>
                      <td className="p-4 font-body text-muted-foreground text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge className={`${STATUS_COLORS[p.status] ?? ""} border text-[10px] capitalize flex items-center gap-1 w-fit`}>
                          <Icon className="w-3 h-3" /> {p.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Record Manual Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Booking</Label>
              <Select value={form.booking_id} onValueChange={handleBookingSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.booking_ref} — {b.guestName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (KES) <span className="text-muted-foreground text-[10px] ml-1">— auto-filled from booking total</span></Label>
              <Input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(v) => setForm({ ...form, payment_method: v as Payment["payment_method"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction Reference (optional)</Label>
              <Input
                placeholder="e.g. M-Pesa code"
                value={form.transaction_ref}
                onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => record.mutate()}
              disabled={!form.booking_id || form.amount <= 0 || record.isPending}
            >
              {record.isPending ? "Recording…" : "Record Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default PaymentsPage;
