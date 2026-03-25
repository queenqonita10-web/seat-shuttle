

# Review & Refinement — PYU-GO Backend Migration

## Status Saat Ini

Fase 1 (Database + Auth) selesai. Fase 2 (Data Layer) setengah jalan — hooks Supabase sudah dibuat, 8 halaman passenger sudah dimigrasi, tetapi ada **build errors** yang memblokir aplikasi dan banyak halaman masih menggunakan mock data.

---

## Temuan: 4 Kategori Masalah

### Kategori 1: Build Errors (Kritis — Aplikasi Tidak Bisa Jalan)

**3 file admin hooks menggunakan `\` (backslash) alih-alih backtick `` ` `` untuk template literals:**

| File | Jumlah Error | Masalah |
|------|-------------|---------|
| `src/hooks/admin/useAdminRoutes.ts` | ~20 errors | `\Failed to create route: \\` harusnya `` `Failed to create route: ${error.message}` `` |
| `src/hooks/admin/useAdminTrips.ts` | ~20 errors | Sama — semua `.select(\...\)` dan `toast.error(\...\)` |
| `src/hooks/admin/useAdminDrivers.ts` | ~10 errors | Sama |

**Perbaikan**: Rewrite ketiga file, ganti semua `\...\` dengan backtick template literals dan `\\` dengan `${error.message}`.

---

### Kategori 2: Halaman Driver — CamelCase vs Snake_Case Mismatch

Driver pages sudah import `useRoutes()` (snake_case data) tapi masih akses properti camelCase dari mock data:

| File | Masalah |
|------|---------|
| `DriverDashboard.tsx` (L126) | `assignedTrip.departureTime` → harusnya `assignedTrip.departure_time` |
| `DriverTripOverview.tsx` (L85) | `activeTrip.routeId` → `activeTrip.route_id`; `route?.pickupPoints` → `route?.pickup_points` |
| `DriverPickupDetail.tsx` (L48-50) | `activeTrip.routeId`, `route?.pickupPoints`, `b.pickupPointId` → snake_case |
| `DriverHistory.tsx` | Masih import `routes` dari `mockData`, akses `trip.routeId` |
| `DriverEarnings.tsx` | Masih import `routes` dari `mockData`, akses `trip.routeId` |
| `DriverProfile.tsx` | Masih import `drivers` dari `mockData` |

**Perbaikan**: 
- Semua driver pages yang masih import dari `mockData` → ganti ke `useRoutes()`, `useDrivers()`
- Semua properti camelCase → snake_case sesuai `DriverContext.tsx` types (yang sudah di-update ke snake_case)
- `DriverPickupDetail.tsx` line 48: `routes` variable tidak didefinisikan — perlu `const { data: routes = [] } = useRoutes()`

---

### Kategori 3: Halaman & Komponen Masih Menggunakan mockData (8 file)

| File | Import dari mockData |
|------|---------------------|
| `src/pages/admin/Dashboard.tsx` | `mockBookings, getBookingsByDay, trips, routes, formatPrice, getFareForPickup, drivers` |
| `src/pages/admin/AdminTrips.tsx` | `trips, routes, drivers, vehicles` |
| `src/pages/admin/AdminBookings.tsx` | Inline mock data (hardcoded array) |
| `src/pages/admin/AdminRoutes.tsx` | Inline mock data (hardcoded array) |
| `src/pages/DriverTracking.tsx` | `pickupPoints, getVehicleType, trips` |
| `src/components/RouteTimeline.tsx` | `PickupPoint, formatPrice` dari mockData |
| `src/components/SeatGrid.tsx` | `Seat, getVehicleType` dari mockData |

**Perbaikan**:
- Admin pages: ganti mock imports dengan admin hooks (`useAdminTrips`, `useAdminBookings`, `useAdminRoutes`, `useAdminDashboard`)
- `DriverTracking.tsx`: ganti mock imports dengan `useRoutes()`, `usePickupPoints()`, data dari `BookingContext`
- `RouteTimeline.tsx`: ubah interface dan import `formatPrice` dari `@/lib/formatters`
- `SeatGrid.tsx`: ubah `Seat` type ke DB-compatible, hapus `getVehicleType` (ambil layout dari `vehicle_types` via props)

---

### Kategori 4: Komponen/Interface Inkompatibel

| Komponen | Masalah |
|----------|---------|
| `RouteTimeline.tsx` | Akses `point.order` dan `point.timeOffset` (camelCase) — DB pakai `sort_order` dan `time_offset` |
| `SeatGrid.tsx` | Akses `seat.number` (mock) — DB pakai `seat_number`; `seat.status === "booked"` — DB pakai status lain |
| `BookingContext.tsx` | `BookingData` masih pakai camelCase (`tripId`, `seatNumber`, `pickupPointId`) — inkonsisten dengan DB |

---

## Rencana Perbaikan (Urutan Prioritas)

### Step 1: Fix Build Errors — 3 Admin Hooks
- Rewrite `useAdminRoutes.ts`, `useAdminTrips.ts`, `useAdminDrivers.ts`
- Ganti semua `\...\` → backtick template literals
- Ganti `\\` → `${error.message}`

### Step 2: Fix Shared Components — RouteTimeline & SeatGrid
- `RouteTimeline.tsx`: update interface ke snake_case (`sort_order`, `time_offset`), import `formatPrice` dari `@/lib/formatters`
- `SeatGrid.tsx`: update `Seat` interface ke `{ id, seat_number, row_num, col_num, status }`, akses via props bukan `getVehicleType`

### Step 3: Fix Driver Pages (6 file)
- `DriverDashboard.tsx`: fix `departureTime` → `departure_time`
- `DriverTripOverview.tsx`: fix semua camelCase → snake_case
- `DriverPickupDetail.tsx`: tambah `useRoutes()` hook, fix semua camelCase
- `DriverHistory.tsx`: ganti mock import → `useRoutes()`
- `DriverEarnings.tsx`: ganti mock import → `useRoutes()`
- `DriverProfile.tsx`: ganti mock import → `useAuth()` atau `useProfile()`

### Step 4: Fix DriverTracking.tsx (Passenger Side)
- Ganti `pickupPoints, getVehicleType, trips` dari mockData → `useRoutes()`, `useTrips()`, data dari `BookingContext`

### Step 5: Migrate Admin Pages ke Real Data (4 file)
- `Dashboard.tsx`: ganti mock → `useAdminDashboard()`
- `AdminTrips.tsx`: ganti mock → `useAdminTrips()` 
- `AdminBookings.tsx`: ganti inline mock → `useAdminBookings()`
- `AdminRoutes.tsx`: ganti inline mock → `useAdminRoutes()`

## File yang Diubah (Total: 16 file)

| File | Aksi |
|------|------|
| `src/hooks/admin/useAdminRoutes.ts` | Fix template literals |
| `src/hooks/admin/useAdminTrips.ts` | Fix template literals |
| `src/hooks/admin/useAdminDrivers.ts` | Fix template literals |
| `src/components/RouteTimeline.tsx` | Update interface ke snake_case |
| `src/components/SeatGrid.tsx` | Update interface ke snake_case |
| `src/pages/driver/DriverDashboard.tsx` | Fix property access |
| `src/pages/driver/DriverTripOverview.tsx` | Fix camelCase → snake_case |
| `src/pages/driver/DriverPickupDetail.tsx` | Add useRoutes, fix properties |
| `src/pages/driver/DriverHistory.tsx` | Replace mock import |
| `src/pages/driver/DriverEarnings.tsx` | Replace mock import |
| `src/pages/driver/DriverProfile.tsx` | Replace mock import |
| `src/pages/DriverTracking.tsx` | Replace mock imports |
| `src/pages/admin/Dashboard.tsx` | Migrate to admin hooks |
| `src/pages/admin/AdminTrips.tsx` | Migrate to admin hooks |
| `src/pages/admin/AdminBookings.tsx` | Migrate to admin hooks |
| `src/pages/admin/AdminRoutes.tsx` | Migrate to admin hooks |

