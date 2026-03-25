

# Fix Build Errors & Ensure /track Works

The `/track` driver tracking page is already fully implemented with the SVG map, timeline, ETA countdown, driver info, and action buttons. However, there are **13 build errors** across multiple files that prevent the app from running. These need to be fixed first.

## Build Error Fixes

### 1. `src/data/mockData.ts` — Add missing `capacity` to vehicleTypes (lines 301, 310, 320)
Three vehicle type entries are missing the required `capacity` field. Add `capacity` based on seat count in each layout.

### 2. `src/pages/Checkout.tsx` — Add missing `status` field (line 44)
The booking object created in `handlePay` is missing `status: "pending"`. Add it.

### 3. `src/pages/admin/AdminAnalytics.tsx` — Missing imports (lines 55, 58, 234, 235, 280)
Add `useState`, `useMemo` from React, `Search` from lucide-react, `Input` from UI components, and `cn` from utils.

### 4. `src/pages/admin/AdminTrips.tsx` — `isBooked` doesn't exist on `Seat` (line 107)
The `Seat` interface uses `status: "available" | "booked"`, not `isBooked`. Fix to `s.status === "booked"`.

### 5. `src/pages/admin/AdminTrips.tsx` — `name` doesn't exist on `Vehicle` (line 143)
`Vehicle` interface has `brand`/`model`, not `name`. The code should look up `VehicleType` instead, or use `vehicle?.brand`.

### 6. `src/pages/admin/AdminVehicles.tsx` — `Clock` not imported (line 531)
Add `Clock` to the lucide-react imports.

### 7. `src/pages/driver/DriverPickupDetail.tsx` — `AlertTriangle` not imported (line 375)
Add `AlertTriangle` to the lucide-react imports.

## Files Modified
- `src/data/mockData.ts` — add `capacity` to 3 vehicle entries
- `src/pages/Checkout.tsx` — add `status` field
- `src/pages/admin/AdminAnalytics.tsx` — add missing imports
- `src/pages/admin/AdminTrips.tsx` — fix `isBooked` and `name` references
- `src/pages/admin/AdminVehicles.tsx` — add `Clock` import
- `src/pages/driver/DriverPickupDetail.tsx` — add `AlertTriangle` import

