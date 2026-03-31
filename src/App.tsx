import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GrainOverlay from "@/components/animations/GrainOverlay";

// Public pages
import Index from "./pages/Index";
import SafariMap from "./pages/SafariMap";
import BookingPage from "./pages/BookingPage";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";

// Guest pages
import GuestDashboard from "./pages/guest/GuestDashboard";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import HousekeepingPage from "./pages/staff/HousekeepingPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import PricingEngine from "./pages/admin/PricingEngine";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import NotificationsAdmin from "./pages/admin/NotificationsAdmin";
import RoomsPage from "./pages/admin/RoomsPage";
import SafarisPage from "./pages/admin/SafarisPage";
import UsersPage from "./pages/admin/UsersPage";
import BookingsPage from "./pages/admin/BookingsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <GrainOverlay />
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/safaris/map" element={<SafariMap />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/login" element={<Login />} />

              {/* Guest */}
              <Route
                path="/guest/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["guest", "admin"]}>
                    <GuestDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["staff", "admin"]}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/housekeeping"
                element={
                  <ProtectedRoute allowedRoles={["staff", "admin"]}>
                    <HousekeepingPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rooms"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/safaris"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SafarisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PricingEngine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <NotificationsAdmin />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
