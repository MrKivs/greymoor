import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Sparkles, Clock, CheckCircle2, Eye,
  Wrench, Plus, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────
type HousekeepingTask = {
  id: string; room_id: string; booking_id: string | null;
  task_type: string; status: string; assigned_to: string | null;
  scheduled_date: string; notes: string | null; completed_at: string | null;
  created_at: string;
  rooms?: { room_number: string; room_type: string; floor: number };
};
type MaintenanceRequest = {
  id: string; room_id: string; reported_by: string | null; assigned_to: string | null;
  title: string; description: string | null; priority: string; status: string;
  created_at: string;
  rooms?: { room_number: string; floor: number };
};
type GuestRequest = {
  id: string; booking_id: string; guest_id: string; room_id: string;
  request_type: string; details: string | null; status: string; created_at: string;
  rooms?: { room_number: string };
};
type StaffMember = { id: string; full_name: string };

// ── Config ────────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:     { label: "Pending",     color: "bg-amber-500/20 text-amber-400 border-amber-500/30",     icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",       icon: Sparkles },
  done:        { label: "Done",        color: "bg-green-500/20 text-green-400 border-green-500/30",    icon: CheckCircle2 },
  inspected:   { label: "Inspected",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Eye },
};
const priorityConfig: Record<string, string> = {
  low:    "bg-muted text-muted-foreground border-border",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgent: "bg-destructive/20 text-destructive border-destructive/30",
};
const taskTypeLabels: Record<string, string> = {
  checkout_clean: "Checkout Clean", stayover_clean: "Stayover Clean",
  turndown: "Turndown Service",     guest_request: "Guest Request",
  deep_clean: "Deep Clean",
};

// ── Component ─────────────────────────────────────────────────────────────────
const HousekeepingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks]               = useState<HousekeepingTask[]>([]);
  const [maintenance, setMaintenance]   = useState<MaintenanceRequest[]>([]);
  const [guestRequests, setGuestReqs]   = useState<GuestRequest[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [rooms, setRooms]               = useState<{ id: string; room_number: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newMaint, setNewMaint]         = useState({ room_id: "", title: "", description: "", priority: "medium" });
  const [dialogOpen, setDialogOpen]     = useState(false);

  // ── Controlled tab: won't reset when data refreshes ──────────────────────
  const [activeTab, setActiveTab] = useState("tasks");

  // ── fetchData: silent=true skips the loading spinner (no tab reset) ───────
  const fetchData = async (silent = false) => {
    if (!silent) setInitialLoading(true);
    const [tR, mR, gR, sR, rR] = await Promise.all([
      supabase.from("housekeeping_tasks").select("*, rooms(room_number, room_type, floor)").order("scheduled_date", { ascending: false }),
      supabase.from("maintenance_requests").select("*, rooms(room_number, floor)").order("created_at", { ascending: false }),
      supabase.from("guest_requests").select("*, rooms(room_number)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("rooms").select("id, room_number").order("room_number"),
    ]);
    if (tR.data) setTasks(tR.data as unknown as HousekeepingTask[]);
    if (mR.data) setMaintenance(mR.data as unknown as MaintenanceRequest[]);
    if (gR.data) setGuestReqs(gR.data as unknown as GuestRequest[]);
    if (sR.data) setStaffMembers(sR.data);
    if (rR.data) setRooms(rR.data);
    if (!silent) setInitialLoading(false);
  };

  useEffect(() => {
    fetchData(false);
    const ch = supabase
      .channel("housekeeping-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_requests" },    () => fetchData(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "housekeeping_tasks" }, () => fetchData(true))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // ── Action handlers (all silent) ──────────────────────────────────────────
  const updateTaskStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "done" || status === "inspected") updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from("housekeeping_tasks").update(updates).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated", description: `Task marked as ${status}` }); fetchData(true); }
  };

  const assignTask = async (id: string, staffId: string) => {
    const { error } = await supabase.from("housekeeping_tasks").update({ assigned_to: staffId }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Assigned" }); fetchData(true); }
  };

  const updateMaintenanceStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "completed") updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("maintenance_requests").update(updates).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated" }); fetchData(true); }
  };

  const updateGuestReqStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("guest_requests").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated" }); fetchData(true); }
  };

  const createMaintRequest = async () => {
    if (!newMaint.room_id || !newMaint.title) {
      toast({ title: "Missing fields", description: "Room and title required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("maintenance_requests").insert({
      room_id: newMaint.room_id, title: newMaint.title,
      description: newMaint.description || null,
      priority: newMaint.priority as "low" | "medium" | "high" | "urgent",
      reported_by: user?.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Created", description: "Maintenance request logged" });
      setNewMaint({ room_id: "", title: "", description: "", priority: "medium" });
      setDialogOpen(false);
      fetchData(true);
    }
  };

  // ── Stats: aggregate across ALL three operation types ──────────────────
  const today          = new Date().toISOString().split("T")[0];

  // Pending: uncompleted housekeeping tasks + pending guest requests
  const pendingCount   = tasks.filter(t => t.status === "pending").length
                       + guestRequests.filter(r => r.status === "pending").length;

  // In Progress: in_progress tasks + accepted (in_progress) guest requests
  const inProgCount    = tasks.filter(t => t.status === "in_progress").length
                       + guestRequests.filter(r => r.status === "in_progress").length;

  // Completed: done/inspected tasks + completed guest requests + completed maintenance
  const doneCount      = tasks.filter(t => t.status === "done" || t.status === "inspected").length
                       + guestRequests.filter(r => r.status === "completed").length
                       + maintenance.filter(m => m.status === "completed").length;

  // Open maintenance: anything not yet completed
  const openMaint      = maintenance.filter(m => m.status !== "completed").length;
  const pendingReqs    = guestRequests.filter(r => r.status === "pending").length;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/staff/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display text-xl font-semibold">
            Housekeeping <span className="text-primary">Operations</span>
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-body">{today}</span>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending",     value: pendingCount, icon: Clock,        color: "text-amber-400",    sub: "tasks + requests" },
            { label: "In Progress", value: inProgCount,  icon: Sparkles,     color: "text-blue-400",     sub: "tasks + requests" },
            { label: "Completed",   value: doneCount,    icon: CheckCircle2, color: "text-green-400",    sub: "all operations" },
            { label: "Maintenance", value: openMaint,    icon: Wrench,       color: "text-destructive",  sub: "open issues" },
          ].map(s => (
            <div key={s.label} className="glass-card p-5">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className="text-2xl font-display font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/50 font-body">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Controlled Tabs — persists through silent refreshes ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tasks">
              Cleaning Tasks
              {pendingCount > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1.5">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="guest-requests">
              Guest Requests
              {pendingReqs > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground text-[10px] px-1.5">{pendingReqs}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              Maintenance
              {openMaint > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white text-[10px] px-1.5">{openMaint}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Cleaning Tasks ── */}
          <TabsContent value="tasks" className="space-y-4">
            {tasks.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">No Cleaning Tasks</h3>
                <p className="text-muted-foreground font-body text-sm">All rooms are sparkling clean.</p>
              </div>
            ) : (
              tasks.map(task => {
                const sc = statusConfig[task.status] || statusConfig.pending;
                const SIcon = sc.icon;
                const isToday = task.scheduled_date === today;
                return (
                  <div key={task.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-display font-semibold">Room {task.rooms?.room_number}</span>
                        <Badge variant="outline" className="text-[10px]">{task.rooms?.room_type}</Badge>
                        <Badge variant="outline" className="text-[10px]">Floor {task.rooms?.floor}</Badge>
                        <Badge className={`text-[10px] border ${isToday ? "bg-primary/20 text-primary border-primary/30" : "bg-muted/40 text-muted-foreground border-border"}`}>
                          {isToday ? "Today" : task.scheduled_date}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-body">{taskTypeLabels[task.task_type] || task.task_type}</p>
                      {task.notes && <p className="text-xs text-muted-foreground/70 mt-1">{task.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Select value={task.assigned_to || ""} onValueChange={v => assignTask(task.id, v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Assign staff" /></SelectTrigger>
                        <SelectContent>
                          {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name || "Unnamed"}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={task.status} onValueChange={v => updateTaskStatus(task.id, v)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-1.5"><cfg.icon className="w-3 h-3" /> {cfg.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge className={`${sc.color} border text-[10px]`}>
                        <SIcon className="w-3 h-3 mr-1" />{sc.label}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* ── Guest Requests ── */}
          <TabsContent value="guest-requests" className="space-y-4">
            {guestRequests.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">No Guest Requests</h3>
                <p className="text-muted-foreground font-body text-sm">All guest needs have been met.</p>
              </div>
            ) : (
              guestRequests.map(req => (
                <div key={req.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold">Room {req.rooms?.room_number}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{req.request_type.replace(/_/g, " ")}</Badge>
                    </div>
                    {req.details && <p className="text-sm text-muted-foreground font-body">{req.details}</p>}
                    <p className="text-xs text-muted-foreground/50 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateGuestReqStatus(req.id, "in_progress")}>Accept</Button>
                        <Button size="sm" onClick={() => updateGuestReqStatus(req.id, "completed")}>Complete</Button>
                      </>
                    )}
                    {req.status === "in_progress" && (
                      <Button size="sm" onClick={() => updateGuestReqStatus(req.id, "completed")}>Mark Complete</Button>
                    )}
                    <Badge className={
                      req.status === "pending"   ? "bg-amber-500/20 text-amber-400 border-amber-500/30 border" :
                      req.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30 border" :
                                                   "bg-blue-500/20 text-blue-400 border-blue-500/30 border"
                    }>{req.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* ── Maintenance ── */}
          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Report Issue</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Report Maintenance Issue</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Select value={newMaint.room_id} onValueChange={v => setNewMaint(p => ({ ...p, room_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                      <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>Room {r.room_number}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Issue title (e.g. Broken AC)" value={newMaint.title} onChange={e => setNewMaint(p => ({ ...p, title: e.target.value }))} />
                    <Textarea placeholder="Details..." value={newMaint.description} onChange={e => setNewMaint(p => ({ ...p, description: e.target.value }))} />
                    <Select value={newMaint.priority} onValueChange={v => setNewMaint(p => ({ ...p, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={createMaintRequest}>Submit Report</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {maintenance.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">No Maintenance Issues</h3>
                <p className="text-muted-foreground font-body text-sm">Everything is running smoothly.</p>
              </div>
            ) : (
              maintenance.map(m => (
                <div key={m.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-display font-semibold">{m.title}</span>
                      <Badge className={`${priorityConfig[m.priority]} border text-[10px]`}>{m.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-body">Room {m.rooms?.room_number} · Floor {m.rooms?.floor}</p>
                    {m.description && <p className="text-xs text-muted-foreground/70 mt-1">{m.description}</p>}
                    <p className="text-xs text-muted-foreground/40 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status !== "completed" && (
                      <Select value={m.status} onValueChange={v => updateMaintenanceStatus(m.id, v)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Badge className={m.status === "completed"
                      ? "bg-green-500/20 text-green-400 border-green-500/30 border"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30 border"
                    }>{m.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HousekeepingPage;
