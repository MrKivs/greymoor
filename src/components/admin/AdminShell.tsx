import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  /** Page title shown next to the back arrow */
  title: string;
  /** If omitted, no back button is shown (used on dashboard itself) */
  backHref?: string;
  /** Optional right-side action slot */
  action?: ReactNode;
}

const AdminShell = ({ children, title, backHref, action }: AdminShellProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {backHref && (
            <Button variant="ghost" size="sm" onClick={() => navigate(backHref)} className="mr-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          {!backHref && (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold">
                Grey<span className="text-primary">moor</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-body">
                Admin
              </span>
            </div>
          )}
          {backHref && (
            <h1 className="font-display text-xl font-semibold">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {action}
          <span className="text-sm text-muted-foreground font-body hidden sm:block">
            {profile?.full_name}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">{children}</div>
    </div>
  );
};

export default AdminShell;
