

# Admin Dashboard for ShuttleGo

## Overview

Build a comprehensive admin dashboard accessible at `/admin` with sidebar navigation, covering all operational aspects of the shuttle app: bookings, trips/schedules, routes, vehicles, passengers, and revenue analytics.

## Pages & Features

### 1. Dashboard Overview (`/admin`)
- Summary stat cards: total bookings today, revenue today, active trips, total passengers
- Revenue chart (bar chart, last 7 days) using Recharts
- Recent bookings table (last 10)
- Quick-action buttons (add trip, view all bookings)

### 2. Bookings Management (`/admin/bookings`)
- Full table of all bookings with columns: ID, passenger, route, seat, pickup point, fare, payment status, date
- Filter by: route, payment status, date range
- Status badge (paid/pending)
- Click row to view booking detail in a sheet/dialog

### 3. Trip & Schedule Management (`/admin/trips`)
- Table of all trips: route, departure time, vehicle type, total seats, booked seats, available seats
- "Add Trip" dialog: select route, departure time, vehicle type
- Edit/delete trip actions
- Seat occupancy progress bar per trip

### 4. Route Management (`/admin/routes`)
- List of routes (Rayon A-D) with destination and number of pickup points
- Expandable rows or click-through to see pickup points with fares and time offsets
- Edit fare/time per pickup point (inline editing)

### 5. Vehicle Management (`/admin/vehicles`)
- List of vehicle types with seat layout preview (reuse SeatGrid in read-only mini mode)
- Seat count, layout name

### 6. Revenue & Analytics (`/admin/analytics`)
- Revenue by route (bar chart)
- Bookings by day (line chart)
- Occupancy rate by vehicle type (pie chart)
- Top pickup points by usage

## Technical Approach

### New Files
- `src/pages/admin/AdminLayout.tsx` — sidebar + outlet layout using shadcn Sidebar
- `src/pages/admin/Dashboard.tsx` — overview stats + charts
- `src/pages/admin/AdminBookings.tsx` — bookings table with filters
- `src/pages/admin/AdminTrips.tsx` — trip management with CRUD dialogs
- `src/pages/admin/AdminRoutes.tsx` — route/pickup point management
- `src/pages/admin/AdminVehicles.tsx` — vehicle type list
- `src/pages/admin/AdminAnalytics.tsx` — charts and analytics

### Mock Data
- Add `mockBookings` array to `mockData.ts` with ~15 sample bookings
- Add helper functions: `getAllBookings()`, `getRevenueByRoute()`, `getBookingsByDay()`

### Routing
- Add nested routes under `/admin` in `App.tsx`
- AdminLayout wraps all admin child routes with sidebar navigation

### Components
- Reuse existing shadcn: Table, Card, Badge, Dialog, Select, Tabs, Chart
- Sidebar with nav links: Dashboard, Bookings, Trips, Routes, Vehicles, Analytics
- Use Recharts (already available via shadcn chart) for all charts

## Files Modified
- `src/App.tsx` — add admin routes
- `src/data/mockData.ts` — add mock bookings + analytics helpers
- 7 new files in `src/pages/admin/`

