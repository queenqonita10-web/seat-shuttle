import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "@/context/BookingContext";
import { DriverProvider } from "@/context/DriverContext";

import Index from "./pages/Index.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SeatSelection from "./pages/SeatSelection.tsx";
import PickupRoute from "./pages/PickupRoute.tsx";
import Checkout from "./pages/Checkout.tsx";
import ETicket from "./pages/ETicket.tsx";
import DriverTracking from "./pages/DriverTracking.tsx";
import NotFound from "./pages/NotFound.tsx";

import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminTrips from "./pages/admin/AdminTrips.tsx";
import AdminRoutes from "./pages/admin/AdminRoutes.tsx";
import AdminVehicles from "./pages/admin/AdminVehicles.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";

import DriverDashboard from "./pages/driver/DriverDashboard.tsx";
import DriverTripOverview from "./pages/driver/DriverTripOverview.tsx";
import DriverPickupDetail from "./pages/driver/DriverPickupDetail.tsx";
import DriverScanner from "./pages/driver/DriverScanner.tsx";
import DriverTripSummary from "./pages/driver/DriverTripSummary.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BookingProvider>
        <DriverProvider>
          <BrowserRouter>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/seats" element={<SeatSelection />} />
              <Route path="/route" element={<PickupRoute />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/eticket" element={<ETicket />} />
              <Route path="/tracking" element={<DriverTracking />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="trips" element={<AdminTrips />} />
                <Route path="routes" element={<AdminRoutes />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              {/* Driver Routes */}
              <Route path="/driver">
                <Route index element={<DriverDashboard />} />
                <Route path="trip" element={<DriverTripOverview />} />
                <Route path="pickup" element={<DriverPickupDetail />} />
                <Route path="scan" element={<DriverScanner />} />
                <Route path="summary" element={<DriverTripSummary />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DriverProvider>
      </BookingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
