

# Review & Refinement — Build Error Fix

## Masalah yang Ditemukan

### 1. Types File Kosong (ROOT CAUSE — Memblokir Semua Admin Hooks)
`src/integrations/supabase/types.ts` hanya berisi placeholder kosong — tidak ada `Tables` type yang di-export. Semua admin hooks (`useAdminTrips`, `useAdminRoutes`, `useAdminDrivers`, `useAdminBookings`, `useAdminDashboard`) import `Tables<"...">` dari file ini dan **GAGAL**.

**Perbaikan**: Hapus semua `import type { Tables }` dari admin hooks. Gunakan inline interface definitions yang sudah match dengan DB schema, karena file types.ts di-auto-generate dan saat ini kosong.

### 2. Dashboard.tsx — `chartData` Tidak Didefinisikan
Line 75: `<BarChart data={chartData}>` tapi `chartData` tidak pernah dideklarasikan. Hook `useAdminBookingTrends` memanggil RPC `get_daily_booking_trends` yang **tidak ada** di database.

**Perbaikan**: Generate chart data dari bookings yang sudah di-fetch — group by day dari `bookings` array, bukan dari RPC yang tidak ada.

### 3. DriverDashboard.tsx — `useTrips` Signature Mismatch
Line 14: `useTrips({ driverId })` tapi `useTrips` expects `routeIds: string[]`, bukan object.
Line 10: `user?.driver_id` — `User` type dari Supabase tidak punya `driver_id`.

**Perbaikan**: Rewrite DriverDashboard untuk fetch trips via langsung query ke supabase dengan driver filter, bukan lewat `useTrips`.

### 4. useDriverLocation.ts — Column Mismatch
Line 17: Upsert menggunakan `latitude`, `longitude`, `timestamp` tapi DB schema punya `lat`, `lng`, `updated_at`.
Line 10: `user.app_metadata.role` — `app_metadata` tidak tersedia langsung.

**Perbaikan**: Fix column names ke `lat`, `lng`. Gunakan `useAuth()` role check, bukan `app_metadata`.

### 5. Edge Function `send-eticket` — Import Error
Line 3: `import { Resend } from 'resend'` — not a Deno dependency.

**Perbaikan**: Ganti ke `import { Resend } from 'npm:resend'` (Deno npm specifier).

### 6. DriverPickupDetail.tsx — Hooks After Return
Line 48: `useRoutes()` dipanggil setelah conditional return (line 43-46). React hooks harus dipanggil sebelum conditional returns.

**Perbaikan**: Pindahkan `useRoutes()` ke atas, sebelum early return.

---

## Rencana Perbaikan (7 file)

### Step 1: Fix Admin Hooks — Remove `Tables` Import
Remove `Tables` type import from 5 admin hooks. Replace with explicit types matching DB columns.

Files: `useAdminTrips.ts`, `useAdminRoutes.ts`, `useAdminDrivers.ts`, `useAdminBookings.ts`, `useAdminDashboard.ts`

### Step 2: Fix Dashboard.tsx — Add chartData
Remove `useAdminBookingTrends` import. Generate `chartData` from bookings array by grouping last 7 days.

### Step 3: Fix DriverDashboard.tsx
Replace `useTrips({ driverId })` with direct supabase query. Remove `user?.driver_id` reference.

### Step 4: Fix useDriverLocation.ts
Fix column names: `latitude` → `lat`, `longitude` → `lng`, `timestamp` → remove (use DB default `updated_at`). Fix role check.

### Step 5: Fix send-eticket Edge Function
Change `import { Resend } from 'resend'` → `import { Resend } from 'npm:resend'`.

### Step 6: Fix DriverPickupDetail.tsx — Hook Order
Move `useRoutes()` call before the early return guard.

## File yang Diubah (9 file)

| File | Aksi |
|------|------|
| `src/hooks/admin/useAdminTrips.ts` | Remove Tables import, use explicit types |
| `src/hooks/admin/useAdminRoutes.ts` | Remove Tables import, use explicit types |
| `src/hooks/admin/useAdminDrivers.ts` | Remove Tables import, use explicit types |
| `src/hooks/admin/useAdminBookings.ts` | Remove Tables import, use explicit types |
| `src/hooks/admin/useAdminDashboard.ts` | Remove Tables import, use explicit types |
| `src/pages/admin/Dashboard.tsx` | Add chartData generation, remove BookingTrends hook |
| `src/pages/driver/DriverDashboard.tsx` | Fix useTrips call, remove driver_id |
| `src/hooks/useDriverLocation.ts` | Fix column names lat/lng |
| `supabase/functions/send-eticket/index.ts` | Fix npm import |
| `src/pages/driver/DriverPickupDetail.tsx` | Fix hooks order |

