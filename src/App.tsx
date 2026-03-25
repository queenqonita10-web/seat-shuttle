import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "@/context/BookingContext";
import { DriverProvider } from "@/context/DriverContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SeatSelection from "./pages/SeatSelection.tsx";
import PickupRoute from "./pages/PickupRoute.tsx";
import Checkout from "./pages/Checkout.tsx";
import ETicket from "./pages/ETicket.tsx";
import DriverTracking from "./pages/DriverTracking.tsx";
import Profile from "./pages/Profile.tsx";
import Tickets from "./pages/Tickets.tsx";
import TicketDetail from "./pages/TicketDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminTrips from "./pages/admin/AdminTrips.tsx";
import AdminRoutes from "./pages/admin/AdminRoutes.tsx";
import AdminVehicles from "./pages/admin/AdminVehicles.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import AdminMonitoring from "./pages/admin/AdminMonitoring.tsx";
import AdminDrivers from "./pages/admin/AdminDrivers.tsx";
import AdminPricing from "./pages/admin/AdminPricing.tsx";
import AdminSeatMap from "./pages/admin/AdminSeatMap.tsx";
import AdminLayoutDesigner from "./pages/admin/AdminLayoutDesigner.tsx";

import DriverDashboard from "./pages/driver/DriverDashboard.tsx";
import DriverTripOverview from "./pages/driver/DriverTripOverview.tsx";
import DriverPickupDetail from "./pages/driver/DriverPickupDetail.tsx";
import DriverScanner from "./pages/driver/DriverScanner.tsx";
import DriverTripSummary from "./pages/driver/DriverTripSummary.tsx";
import DriverHistory from "./pages/driver/DriverHistory.tsx";
import DriverEarnings from "./pages/driver/DriverEarnings.tsx";
import DriverProfile from "./pages/driver/DriverProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BookingProvider>
          <DriverProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* User Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/seats" element={<SeatSelection />} />
                <Route path="/route" element={<PickupRoute />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/ticket/:id" element={<TicketDetail />} />
                <Route path="/eticket" element={<ETicket />} />
                <Route path="/track" element={<DriverTracking />} />

                {/* Admin Routes — Protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="monitoring" element={<AdminMonitoring />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="seat-map" element={<AdminSeatMap />} />
                  <Route path="layout-designer" element={<AdminLayoutDesigner />} />
                  <Route path="trips" element={<AdminTrips />} />
                  <Route path="routes" element={<AdminRoutes />} />
                  <Route path="drivers" element={<AdminDrivers />} />
                  <Route path="vehicles" element={<AdminVehicles />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* Driver Routes — Protected */}
                <Route path="/driver">
                  <Route
                    index
                    element={
                      <ProtectedRoute requiredRole="driver">
                        <DriverDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="trip" element={<ProtectedRoute requiredRole="driver"><DriverTripOverview /></ProtectedRoute>} />
                  <Route path="pickup" element={<ProtectedRoute requiredRole="driver"><DriverPickupDetail /></ProtectedRoute>} />
                  <Route path="scan" element={<ProtectedRoute requiredRole="driver"><DriverScanner /></ProtectedRoute>} />
                  <Route path="summary" element={<ProtectedRoute requiredRole="driver"><DriverTripSummary /></ProtectedRoute>} />
                  <Route path="history" element={<ProtectedRoute requiredRole="driver"><DriverHistory /></ProtectedRoute>} />
                  <Route path="earnings" element={<ProtectedRoute requiredRole="driver"><DriverEarnings /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute requiredRole="driver"><DriverProfile /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DriverProvider>
        </BookingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
