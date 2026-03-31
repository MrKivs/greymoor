import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Map, Clock, Users, Mountain } from "lucide-react";

type Safari = {
  id: string;
  name: string;
  duration_days: number;
  max_group_size: number;
  price_per_person: number;
  difficulty_level: "easy" | "moderate" | "challenging" | "extreme";
  cover_image: string | null;
  highlights: string[] | null;
  status: "active" | "draft" | "archived";
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  moderate: "text-primary",
  challenging: "text-accent",
  extreme: "text-destructive",
};

const EMPTY_FORM = {
  name: "",
  duration_days: 3,
  max_group_size: 8,
  price_per_person: 80000,
  difficulty_level: "moderate" as Safari["difficulty_level"],
  cover_image: "",
  highlights: "",
  status: "draft" as Safari["status"],
};

const SafarisPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editSafari, setEditSafari] = useState<Safari | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: safaris = [], isLoading } = useQuery({
    queryKey: ["admin-safaris"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safari_packages")
        .select("id, name, duration_days, max_group_size, price_per_person, difficulty_level, cover_image, highlights, status")
        .order("name");
      if (error) throw error;
      return data as Safari[];
    },
  });

  const openAdd = () => {
    setEditSafari(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (s: Safari) => {
    setEditSafari(s);
    setForm({
      name: s.name,
      duration_days: s.duration_days,
      max_group_size: s.max_group_size,
      price_per_person: s.price_per_person,
      difficulty_level: s.difficulty_level,
      cover_image: s.cover_image ?? "",
      highlights: (s.highlights ?? []).join(", "),
      status: s.status,
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        duration_days: form.duration_days,
        max_group_size: form.max_group_size,
        price_per_person: form.price_per_person,
        difficulty_level: form.difficulty_level,
        cover_image: form.cover_image || null,
        highlights: form.highlights ? form.highlights.split(",").map((h) => h.trim()).filter(Boolean) : null,
        status: form.status,
      };
      if (editSafari) {
        const { error } = await supabase.from("safari_packages").update(payload).eq("id", editSafari.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("safari_packages").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-safaris"] });
      setOpen(false);
      toast.success(editSafari ? "Safari updated" : "Safari created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "draft" : "active";
      const { error } = await supabase.from("safari_packages").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-safaris"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("safari_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-safaris"] });
      toast.success("Safari deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      title="Safari Packages"
      backHref="/admin/dashboard"
      action={
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Safari
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Packages", value: safaris.length },
          { label: "Active", value: safaris.filter((s) => s.status === "active").length },
          { label: "Draft", value: safaris.filter((s) => s.status === "draft").length },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className="text-3xl font-display font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading packages…</div>
      ) : safaris.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-xl mb-2">No Safari Packages</p>
          <p className="text-sm text-muted-foreground font-body mb-6">Create your first safari package.</p>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Safari</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safaris.map((s) => (
            <div key={s.id} className={`glass-card overflow-hidden ${s.status === "draft" ? "opacity-60" : ""}`}>
              <div className="relative h-40 overflow-hidden bg-muted/20">
                {s.cover_image ? (
                  <img src={s.cover_image} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Map className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className={s.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30 border" : "bg-muted/60 text-muted-foreground border"}>
                    {s.status}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold mb-2">{s.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration_days} Days</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {s.max_group_size}</span>
                  <span className={`flex items-center gap-1 ${DIFFICULTY_COLORS[s.difficulty_level] ?? ""}`}>
                    <Mountain className="w-3.5 h-3.5" /> {s.difficulty_level}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div>
                    <span className="text-xl font-display font-semibold">
                      KES {Number(s.price_per_person).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-body ml-1">/person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.status === "active"}
                      onCheckedChange={() => toggleStatus.mutate({ id: s.id, status: s.status })}
                    />
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (confirm(`Delete ${s.name}?`)) del.mutate(s.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editSafari ? "Edit Safari" : "Add Safari Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Package Name</Label>
              <Input placeholder="e.g. Big Five Masai Mara" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (days)</Label>
                <Input type="number" min={1} value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Max Group Size</Label>
                <Input type="number" min={1} value={form.max_group_size} onChange={(e) => setForm({ ...form, max_group_size: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Person (KES)</Label>
                <Input type="number" min={0} value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty_level} onValueChange={(v) => setForm({ ...form, difficulty_level: v as Safari["difficulty_level"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["easy", "moderate", "challenging", "extreme"].map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input placeholder="https://..." value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
            </div>
            <div>
              <Label>Highlights (comma-separated)</Label>
              <Input placeholder="Lion tracking, Sundowners, Hot air balloon" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Safari["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["active", "draft", "archived"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
              {save.isPending ? "Saving…" : editSafari ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default SafarisPage;
