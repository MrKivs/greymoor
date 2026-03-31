import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, ShieldCheck, Briefcase, User } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

type UserRole = {
  user_id: string;
  role: "admin" | "staff" | "guest";
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  staff: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  guest: "bg-muted/40 text-muted-foreground border-border",
};

const ROLE_ICONS = { admin: ShieldCheck, staff: Briefcase, guest: User };

const UsersPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole["role"] }) => {
      // Upsert: update if exists, insert if not
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getRole = (userId: string): UserRole["role"] =>
    roles.find((r) => r.user_id === userId)?.role ?? "guest";

  const roleCounts = {
    admin: roles.filter((r) => r.role === "admin").length,
    staff: roles.filter((r) => r.role === "staff").length,
    guest: roles.filter((r) => r.role === "guest").length + (profiles.length - roles.length),
  };

  return (
    <AdminShell title="Users" backHref="/admin/dashboard">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["admin", "staff", "guest"] as const).map((role) => {
          const Icon = ROLE_ICONS[role];
          return (
            <div key={role} className="glass-card p-5 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-display font-semibold capitalize">{role}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{roleCounts[role]} users</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {loadingProfiles ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading users…</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/30 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg">All Users ({profiles.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground font-body text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Current Role</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-right p-4">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {profiles.map((p) => {
                  const role = getRole(p.id);
                  const Icon = ROLE_ICONS[role];
                  const isSelf = p.id === user?.id;
                  return (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-body font-medium">
                            {p.full_name || "—"}
                            {isSelf && (
                              <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-body text-sm">{p.email}</td>
                      <td className="p-4">
                        <Badge className={`${ROLE_COLORS[role]} border text-[10px] capitalize`}>
                          {role}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground font-body text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Select
                          value={role}
                          onValueChange={(v) => {
                            if (isSelf) {
                              toast.error("You cannot change your own role");
                              return;
                            }
                            changeRole.mutate({ userId: p.id, role: v as UserRole["role"] });
                          }}
                          disabled={isSelf}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["admin", "staff", "guest"].map((r) => (
                              <SelectItem key={r} value={r} className="capitalize text-xs">{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default UsersPage;
