

# Improve UX: Seat Selection & Pickup Clarity

Based on the uploaded reference images, the app needs two major updates:

## 1. Accurate Seat Layouts by Vehicle Type

The reference shows three distinct vehicle layouts that differ from the current generic 4x10 grid:

- **Mini Bus/SUV (without roof rack)**: 3 passenger seats — Row 1: seat 1 + DRIVER, Row 2: seats 2-3, Row 3: Baggage
- **Mini Bus/SUV (with roof rack)**: 5 passenger seats — Row 1: seat 1 + DRIVER, Row 2: seats 2-3, Row 3: seats 4-5, then BAGGAGE ROOF
- **HI ACE (without roof rack)**: 10 passenger seats — Row 1: seat 1 + DRIVER, Row 2: seats 2-3-4, Row 3: seats 5-6-7, Row 4: seats 8-9-10, then BAGGAGE

### Changes to `mockData.ts`
- Add a `VehicleType` with id, name, and seat layout definition (rows/cols/skip positions)
- Add `vehicleType` field to `Trip` interface
- Replace `generateSeats()` with layout-aware seat generators for each vehicle type
- Update trips to use specific vehicle types

### Changes to `SeatGrid.tsx`
- Render seat grid dynamically based on vehicle layout (variable columns per row)
- Add "DRIVER" label in the correct position (top-right)
- Add "BAGGAGE" area indicator at the bottom
- Show vehicle type name at top of grid
- Increase tap target size to `h-10 w-10`

## 2. Real Route Data with Per-Pickup Fares

The reference shows each pickup point has its own fare (not a flat trip price). For example Rayon A: J1=0, J2=700, J3=950, etc., with a total fare at destination.

### Changes to `mockData.ts`
- Add `fare` field to `PickupPoint` interface (fare in Rupiah from that point)
- Update pickup point data per rayon with real times and fares from the reference
- Each route gets its own pickup points array with correct `timeOffset` and `fare` values
- Update `Trip.price` to be dynamic based on selected pickup point, or remove flat price
- Add helper `getFareForPickup(route, pickupPointId)` function

### Changes to `SearchResults.tsx`
- Show fare based on selected pickup point instead of flat trip price
- Make pickup time more prominent with a colored badge

### Changes to `SeatSelection.tsx`
- Add pickup info banner below header showing pickup point + estimated time
- Show seat position label (e.g., "Window" / "Aisle") in bottom bar

### Changes to `PickupRoute.tsx`
- Show fare at each pickup point in the timeline
- Add summary card: "Board at [point] · Arrive by [time]"

### Changes to `Checkout.tsx`
- Add boarding reminder banner: "Be at [pickup point] by [time]"
- Show fare from selected pickup point (not flat price)

## Files Modified
- `src/data/mockData.ts` — vehicle types, per-pickup fares, real route data
- `src/components/SeatGrid.tsx` — dynamic layout, driver/baggage labels, larger buttons
- `src/pages/SeatSelection.tsx` — pickup banner, seat position info
- `src/pages/SearchResults.tsx` — pickup-based fare, prominent pickup time
- `src/pages/PickupRoute.tsx` — fare per stop, summary card
- `src/pages/Checkout.tsx` — boarding reminder, correct fare
- `src/context/BookingContext.tsx` — no changes needed

