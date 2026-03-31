import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Calendar, Clock, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RULE_TYPES = [
  { value: "peak_season", label: "Peak Season", icon: TrendingUp, description: "Higher rates during busy periods" },
  { value: "low_season", label: "Low Season", icon: TrendingDown, description: "Discounted rates during quiet periods" },
  { value: "weekend_surcharge", label: "Weekend Surcharge", icon: Calendar, description: "Extra charge for Fri-Sun stays" },
  { value: "last_minute", label: "Last Minute Discount", icon: Clock, description: "Discount for bookings within X hours" },
  { value: "long_stay", label: "Long Stay Discount", icon: Moon, description: "Discount for stays of X+ nights" },
];

const ROOM_TYPES = ["standard", "deluxe", "suite", "villa"];

interface PricingRule {
  id: string;
  name: string;
  rule_type: string;
  room_type: string | null;
  multiplier: number;
  start_date: string | null;
  end_date: string | null;
  min_nights: number | null;
  max_hours_before: number | null;
  is_active: boolean;
  priority: number;
}

const PricingEngine = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rule_type: "peak_season",
    room_type: "" as string,
    multiplier: 1.2,
    start_date: "",
    end_date: "",
    min_nights: 7,
    max_hours_before: 48,
    priority: 0,
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as PricingRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: form.name,
        rule_type: form.rule_type,
        room_type: form.room_type || null,
        multiplier: form.multiplier,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        min_nights: form.rule_type === "long_stay" ? form.min_nights : null,
        max_hours_before: form.rule_type === "last_minute" ? form.max_hours_before : null,
        priority: form.priority,
      };
      const { error } = await supabase.from("pricing_rules").insert([payload as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      setShowForm(false);
      setForm({ name: "", rule_type: "peak_season", room_type: "", multiplier: 1.2, start_date: "", end_date: "", min_nights: 7, max_hours_before: 48, priority: 0 });
      toast.success("Pricing rule created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("pricing_rules").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricing-rules"] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast.success("Rule deleted");
    },
  });

  const multiplierToPercent = (m: number) => {
    const pct = ((m - 1) * 100).toFixed(0);
    return m >= 1 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-xl font-semibold">Seasonal Pricing Engine</h1>
        </div>
        <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Rule
        </Button>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {RULE_TYPES.map((rt) => {
            const count = rules.filter((r) => r.rule_type === rt.value && r.is_active).length;
            return (
              <div key={rt.value} className="glass-card p-4 text-center">
                <rt.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold">{count}</p>
                <p className="text-xs text-muted-foreground font-body">{rt.label}</p>
              </div>
            );
          })}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="glass-card p-6 mb-8 space-y-4">
            <h3 className="font-display text-lg">Create Pricing Rule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Christmas Peak" />
              </div>
              <div>
                <Label>Rule Type</Label>
                <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Room Type (optional)</Label>
                <Select value={form.room_type} onValueChange={(v) => setForm({ ...form, room_type: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="All rooms" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Room Types</SelectItem>
                    {ROOM_TYPES.map((rt) => (
                      <SelectItem key={rt} value={rt} className="capitalize">{rt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price Multiplier ({multiplierToPercent(form.multiplier)})</Label>
                <Input type="number" step="0.05" min="0.1" max="3" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: parseFloat(e.target.value) || 1 })} />
              </div>
              {["peak_season", "low_season"].includes(form.rule_type) && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </>
              )}
              {form.rule_type === "long_stay" && (
                <div>
                  <Label>Minimum Nights</Label>
                  <Input type="number" min="2" value={form.min_nights} onChange={(e) => setForm({ ...form, min_nights: parseInt(e.target.value) || 7 })} />
                </div>
              )}
              {form.rule_type === "last_minute" && (
                <div>
                  <Label>Max Hours Before Check-in</Label>
                  <Input type="number" min="1" value={form.max_hours_before} onChange={(e) => setForm({ ...form, max_hours_before: parseInt(e.target.value) || 48 })} />
                </div>
              )}
              <div>
                <Label>Priority (higher = applied first)</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => createRule.mutate()} disabled={!form.name || createRule.isPending}>
                {createRule.isPending ? "Creating..." : "Create Rule"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Rules list */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">No Pricing Rules</h3>
            <p className="text-muted-foreground font-body text-sm">Create your first rule to start dynamic pricing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const rt = RULE_TYPES.find((t) => t.value === rule.rule_type);
              const Icon = rt?.icon || TrendingUp;
              return (
                <div key={rule.id} className={`glass-card p-4 flex items-center gap-4 ${!rule.is_active ? "opacity-50" : ""}`}>
                  <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-medium truncate">{rule.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{rt?.label}</span>
                      {rule.room_type && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground font-body capitalize">{rule.room_type}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-body">
                      {multiplierToPercent(rule.multiplier)} price adjustment
                      {rule.start_date && rule.end_date && ` · ${rule.start_date} → ${rule.end_date}`}
                      {rule.min_nights && ` · ${rule.min_nights}+ nights`}
                      {rule.max_hours_before && ` · within ${rule.max_hours_before}h`}
                      {` · Priority: ${rule.priority}`}
                    </p>
                  </div>
                  <Switch checked={rule.is_active} onCheckedChange={(v) => toggleRule.mutate({ id: rule.id, is_active: v })} />
                  <Button variant="ghost" size="sm" onClick={() => deleteRule.mutate(rule.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingEngine;
