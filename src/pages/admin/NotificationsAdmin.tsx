import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  sent: CheckCircle,
  delivered: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
};

const NotificationsAdmin = () => {
  const navigate = useNavigate();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["notification-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === "sent" || l.status === "delivered").length,
    failed: logs.filter((l) => l.status === "failed").length,
    pending: logs.filter((l) => l.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border/30 px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="font-display text-xl font-semibold">Notifications Center</h1>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sent", value: stats.total, icon: Mail },
            { label: "Delivered", value: stats.sent, icon: CheckCircle },
            { label: "Failed", value: stats.failed, icon: XCircle },
            { label: "Pending", value: stats.pending, icon: Clock },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Integration Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { channel: "Email", icon: Mail, description: "Automated booking & payment emails", status: "Ready" },
            { channel: "SMS (Africa's Talking)", icon: Phone, description: "Booking confirmations & reminders via SMS", status: "API Key Required" },
            { channel: "M-Pesa (Daraja)", icon: MessageSquare, description: "STK Push payments & confirmations", status: "API Key Required" },
          ].map((ch) => (
            <div key={ch.channel} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <ch.icon className="w-6 h-6 text-primary" />
                <h3 className="font-display font-medium">{ch.channel}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-body mb-3">{ch.description}</p>
              <span className={`text-xs px-2 py-1 rounded-full font-body ${
                ch.status === "Ready" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {ch.status}
              </span>
            </div>
          ))}
        </div>

        {/* Notification log */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-display text-lg">Recent Notifications</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-body text-sm">
              No notifications sent yet. Notifications will appear here once integrations are configured.
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {logs.map((log) => {
                const ChannelIcon = CHANNEL_ICONS[log.channel] || Mail;
                const StatusIcon = STATUS_ICONS[log.status] || Clock;
                return (
                  <div key={log.id} className="p-4 flex items-center gap-4">
                    <ChannelIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body truncate">{log.message_preview || log.event_type}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(log.created_at).toLocaleString()} · {log.channel} · {log.event_type}
                      </p>
                    </div>
                    <StatusIcon className={`w-4 h-4 flex-shrink-0 ${
                      log.status === "failed" ? "text-destructive" : log.status === "pending" ? "text-amber-400" : "text-green-400"
                    }`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsAdmin;
