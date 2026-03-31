import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "staff" | "guest")[];
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, role, loading } = useAuth();

  // Still fetching auth state
  if (loading) return <Spinner />;

  // Not logged in at all → go to login
  if (!session) return <Navigate to="/login" replace />;

  // Logged in but role hasn't loaded from DB yet → keep spinner
  // (avoids false redirect while fetchUserData is in flight)
  if (!role) return <Spinner />;

  // Logged in but wrong role for this route → redirect to correct portal
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      admin: "/admin/dashboard",
      staff: "/staff/dashboard",
      guest: "/guest/dashboard",
    } as const;
    return <Navigate to={redirectMap[role] ?? "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

