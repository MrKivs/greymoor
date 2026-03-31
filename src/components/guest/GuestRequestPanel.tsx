import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { BellRing, Shirt, SprayCan, Moon, Coffee, Loader2, CheckCircle2 } from "lucide-react";

const REQUEST_TYPES = [
  { type: "extra_towels", label: "Extra Towels", icon: Shirt, description: "Fresh towels delivered to your room" },
  { type: "room_cleaning", label: "Room Cleaning", icon: SprayCan, description: "Request immediate room cleaning" },
  { type: "turndown", label: "Turndown Service", icon: Moon, description: "Evening turndown preparation" },
  { type: "minibar_restock", label: "Minibar Restock", icon: Coffee, description: "Restock your in-room minibar" },
];

type GuestReq = {
  id: string;
  request_type: string;
  details: string | null;
  status: string;
  created_at: string;
};

const GuestRequestPanel = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<GuestReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [details, setDetails] = useState("");
  const [activeBooking, setActiveBooking] = useState<{ id: string; room_id: string } | null>(null);
  const [dnd, setDnd] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Get active booking
      const { data: booking } = await supabase
        .from("bookings")
        .select("id, room_id")
        .eq("customer_id", user.id)
        .in("status", ["confirmed", "checked_in"])
        .limit(1)
        .maybeSingle();

      if (booking) {
        setActiveBooking(booking);
        const { data: reqs } = await supabase
          .from("guest_requests")
          .select("id, request_type, details, status, created_at")
          .eq("booking_id", booking.id)
          .order("created_at", { ascending: false });
        if (reqs) setRequests(reqs);
      }
      setLoading(false);
    };

    fetchData();

    // Realtime updates
    const channel = supabase
      .channel("guest-requests-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_requests" }, () => {
        if (activeBooking) {
          supabase
            .from("guest_requests")
            .select("id, request_type, details, status, created_at")
            .eq("booking_id", activeBooking.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => { if (data) setRequests(data); });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const submitRequest = async () => {
    if (!activeBooking || !selectedType || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("guest_requests").insert({
      booking_id: activeBooking.id,
      guest_id: user.id,
      room_id: activeBooking.room_id,
      request_type: selectedType,
      details: details || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Sent", description: "Our team has been notified." });
      setSelectedType("");
      setDetails("");
      setDialogOpen(false);
    }
  };

  const toggleDND = async () => {
    if (!activeBooking || !user) return;
    const newDnd = !dnd;
    setDnd(newDnd);
    // Submit as a guest request so staff sees it
    if (newDnd) {
      await supabase.from("guest_requests").insert({
        booking_id: activeBooking.id,
        guest_id: user.id,
        room_id: activeBooking.room_id,
        request_type: "do_not_disturb",
        details: "Guest has enabled Do Not Disturb",
      });
      toast({ title: "Do Not Disturb", description: "Staff has been notified." });
    } else {
      toast({ title: "Do Not Disturb Off", description: "Normal service resumed." });
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto my-8" />;

  if (!activeBooking) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Room Services</h3>
        <Button
          variant={dnd ? "destructive" : "outline"}
          size="sm"
          onClick={toggleDND}
        >
          <Moon className="w-4 h-4 mr-1" />
          {dnd ? "DND On" : "Do Not Disturb"}
        </Button>
      </div>

      {/* Quick Request Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {REQUEST_TYPES.map(rt => (
          <button
            key={rt.type}
            className="glass-card-hover p-4 text-left group"
            onClick={() => { setSelectedType(rt.type); setDialogOpen(true); }}
          >
            <rt.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-display font-medium">{rt.label}</p>
            <p className="text-[11px] text-muted-foreground font-body">{rt.description}</p>
          </button>
        ))}
      </div>

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {REQUEST_TYPES.find(r => r.type === selectedType)?.label || "Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea
              placeholder="Any special instructions? (optional)"
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
            <Button className="w-full" onClick={submitRequest} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BellRing className="w-4 h-4 mr-2" />}
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Recent Requests</p>
          {requests.slice(0, 5).map(req => (
            <div key={req.id} className="glass-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-body capitalize">{req.request_type.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(req.created_at).toLocaleTimeString()}</p>
              </div>
              <Badge className={
                req.status === "completed"
                  ? "bg-green-500/20 text-green-400 border-green-500/30 border text-[10px]"
                  : req.status === "in_progress"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30 border text-[10px]"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/30 border text-[10px]"
              }>
                {req.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {req.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestRequestPanel;
