import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Bed, Users } from "lucide-react";

type Room = {
  id: string;
  room_number: string;
  floor: number;
  room_type: "standard" | "deluxe" | "suite" | "villa";
  capacity: number;
  price_per_night: number;
  status: "available" | "occupied" | "maintenance" | "out_of_order";
  description: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  occupied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  out_of_order: "bg-destructive/20 text-destructive border-destructive/30",
};

const EMPTY_FORM = {
  room_number: "",
  floor: 1,
  room_type: "standard" as Room["room_type"],
  capacity: 2,
  price_per_night: 15000,
  status: "available" as Room["status"],
  description: "",
};

const RoomsPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");
      if (error) throw error;
      return data as Room[];
    },
  });

  const openAdd = () => {
    setEditRoom(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditRoom(r);
    setForm({
      room_number: r.room_number,
      floor: r.floor,
      room_type: r.room_type,
      capacity: r.capacity,
      price_per_night: r.price_per_night,
      status: r.status,
      description: r.description ?? "",
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        room_number: form.room_number,
        floor: form.floor,
        room_type: form.room_type,
        capacity: form.capacity,
        price_per_night: form.price_per_night,
        status: form.status,
        description: form.description || null,
      };
      if (editRoom) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rooms").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      setOpen(false);
      toast.success(editRoom ? "Room updated" : "Room created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      toast.success("Room deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance" || r.status === "out_of_order").length,
  };

  return (
    <AdminShell
      title="Rooms Management"
      backHref="/admin/dashboard"
      action={
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Room
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Rooms", value: stats.total, color: "text-foreground" },
          { label: "Available", value: stats.available, color: "text-green-400" },
          { label: "Occupied", value: stats.occupied, color: "text-blue-400" },
          { label: "Maintenance", value: stats.maintenance, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className={`text-3xl font-display font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading rooms…</div>
      ) : rooms.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-xl mb-2">No Rooms Yet</p>
          <p className="text-sm text-muted-foreground font-body mb-6">Add your first room to get started.</p>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Room</Button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground font-body text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Room</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Floor</th>
                  <th className="text-left p-4">Capacity</th>
                  <th className="text-left p-4">Price/Night</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-display font-semibold">Room {r.room_number}</td>
                    <td className="p-4 font-body capitalize text-muted-foreground">{r.room_type}</td>
                    <td className="p-4 font-body text-muted-foreground">{r.floor}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-muted-foreground font-body">
                        <Users className="w-3.5 h-3.5" /> {r.capacity}
                      </span>
                    </td>
                    <td className="p-4 font-display font-semibold">
                      KES {Number(r.price_per_night).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`${STATUS_COLORS[r.status] ?? ""} border text-[10px] capitalize`}
                      >
                        {r.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete Room ${r.room_number}?`)) del.mutate(r.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Number</Label>
                <Input
                  placeholder="e.g. 101"
                  value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Floor</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.room_type}
                  onValueChange={(v) => setForm({ ...form, room_type: v as Room["room_type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["standard", "deluxe", "suite", "villa"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Night (KES)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_per_night}
                  onChange={(e) => setForm({ ...form, price_per_night: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as Room["status"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["available", "occupied", "maintenance", "out_of_order"].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe the room's views, features…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => save.mutate()}
              disabled={!form.room_number || save.isPending}
            >
              {save.isPending ? "Saving…" : editRoom ? "Save Changes" : "Create Room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default RoomsPage;
