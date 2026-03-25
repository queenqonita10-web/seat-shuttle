# Implementasi Backend Production-Ready — PYU-GO

## Ringkasan

Aplikasi saat ini 100% client-side dengan mock data di `mockData.ts` dan state management via React Context. Semua data (routes, trips, vehicles, drivers, bookings, tickets) hardcoded. Tidak ada autentikasi, tidak ada database, tidak ada RLS.

Rencana ini membagi implementasi menjadi **4 fase** yang harus dilakukan bertahap karena skala perubahannya sangat besar. Setiap fase adalah 1 pesan/approval terpisah.

---

## Fase 1: Setup Supabase + Database Schema + Auth Foundation

### 1.1 Connect Supabase

- Hubungkan project Supabase eksternal ke Lovable
- Setup Supabase client (`src/integrations/supabase/`)

### 1.2 Database Schema (Migration)

Buat semua tabel berikut:

```text
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  auth.users  │────▶│   profiles   │     │   user_roles   │
│  (built-in)  │     │ name, phone  │     │ user_id, role  │
└─────────────┘     │ avatar, pts  │     │ (enum: admin,  │
                    └──────────────┘     │  driver,       │
                                         │  passenger)    │
                                         └────────────────┘

┌──────────┐    ┌───────────────┐    ┌──────────┐
│  routes  │───▶│ pickup_points │    │ vehicles │
│ code,    │    │ label, order  │    │ brand,   │
│ origin,  │    │ time_offset   │    │ plate,   │
│ dest     │    │ fare          │    │ status   │
└──────────┘    └───────────────┘    └──────────┘

┌──────────────┐    ┌──────────┐    ┌──────────────┐
│ vehicle_types│    │  trips   │    │   bookings   │
│ name, layout │    │ route_id │    │ trip_id,     │
│ capacity     │    │ vehicle  │    │ seat, pickup │
└──────────────┘    │ driver   │    │ passenger    │
                    │ depart   │    │ payment      │
                    └──────────┘    └──────────────┘

┌──────────┐    ┌──────────────────┐    ┌────────────┐
│  seats   │    │ driver_locations  │    │   tickets  │
│ trip_id  │    │ driver_id, lat   │    │ booking_id │
│ number   │    │ lng, timestamp   │    │ status     │
│ status   │    └──────────────────┘    └────────────┘
└──────────┘

┌──────────────┐    ┌──────────────────────┐
│   drivers    │    │ seat_layout_templates │
│ user_id      │    │ name, rows, cols     │
│ phone, name  │    │ layout (jsonb)       │
│ status       │    └──────────────────────┘
└──────────────┘

┌──────────────┐
│  audit_logs  │
│ user_id      │
│ action, mod  │
│ details      │
└──────────────┘
```

### 1.3 Auth + Roles

- Enum `app_role`: `admin`, `driver`
- Tabel `user_roles` dengan RLS
- Function `has_role(user_id, role)` (SECURITY DEFINER)
- Tabel `profiles` dengan trigger auto-create on signup
- Halaman Login/Register untuk passenger
- Halaman Login untuk driver & admin

### 1.4 RLS Policies

- `profiles`: user bisa baca/update profil sendiri
- `routes`, `pickup_points`, `vehicle_types`: public read, admin write
- `trips`, `seats`: public read, admin write
- `bookings`: passenger bisa buat & baca milik sendiri, admin baca semua
- `tickets`: passenger baca milik sendiri, admin baca semua
- `vehicles`, `drivers`: admin only
- `driver_locations`: driver update milik sendiri, passenger baca
- `audit_logs`: admin only

### File yang dibuat/diubah:

- **Baru**: Migration SQL (via Supabase)
- **Baru**: `src/integrations/supabase/client.ts`
- **Baru**: `src/integrations/supabase/types.ts`
- **Baru**: `src/pages/Auth.tsx` (Login/Register)
- **Baru**: `src/components/ProtectedRoute.tsx`
- **Edit**: `src/App.tsx` — tambah auth routes + protected routes

---

## Fase 2: Data Layer — Replace Mock Data dengan Supabase Queries

### 2.1 Seed Data

- Insert semua mock data (routes, pickup_points, vehicle_types, vehicles, drivers, trips) ke database via migration

### 2.2 Custom Hooks (React Query + Supabase)

Ganti semua import dari `mockData.ts` dengan hooks:

- `useRoutes()` — fetch routes + pickup_points
- `useTrips(routeId)` — fetch trips + seats
- `useBookings()` — fetch user bookings
- `useTickets()` — fetch user tickets
- `useDrivers()` — admin: fetch all drivers
- `useVehicles()` — admin: fetch all vehicles
- `useCreateBooking()` — mutation create booking + ticket
- `useUpdateBookingStatus()` — driver/admin mutation

### 2.3 Update Semua Pages

Halaman yang perlu diubah dari mock ke real data:

- `Index.tsx`, `SearchResults.tsx`, `SeatSelection.tsx`, `PickupRoute.tsx`
- `Checkout.tsx`, `ETicket.tsx`, `Tickets.tsx`, `TicketDetail.tsx`
- `DriverTracking.tsx`
- Semua halaman `/admin/*` (12 file)
- Semua halaman `/driver/*` (8 file)

### File yang dibuat/diubah:

- **Baru**: `src/hooks/useRoutes.ts`, `useTrips.ts`, `useBookings.ts`, dll
- **Edit**: Semua 25+ page files

---

## Fase 3: Driver Module Backend

### 3.1 Driver Location Tracking (Real-time)

- Ganti `localStorage` caching di `trackingService.ts` dengan Supabase `driver_locations` table
- Gunakan Supabase Realtime subscription untuk live tracking
- Update `DriverContext.tsx` untuk write ke database

### 3.2 Driver Operations

- Booking status updates (picked_up, no_show) write ke database
- Trip completion flow dengan summary persist
- Incident reports persist ke database

### File yang diubah:

- **Edit**: `src/services/trackingService.ts`
- **Edit**: `src/context/DriverContext.tsx`
- **Edit**: `src/pages/DriverTracking.tsx` — realtime subscription
- **Edit**: Driver pages — real data

---

## Fase 4: Admin Module + Edge Functions

### 4.1 Admin CRUD Operations

- Routes: create, update, soft-delete
- Trips: create, assign driver/vehicle, update status
- Vehicles: CRUD + status management
- Drivers: CRUD + assignment
- Bookings: view, cancel, refund status

### 4.2 Edge Functions

- `create-booking` — atomic booking creation (seat lock + payment + ticket generation)
- `cancel-booking` — handle refund logic + seat release
- `trip-summary` — aggregate trip data for driver summary

### 4.3 Analytics (Real Data)

- Revenue queries dari bookings table
- Booking trends dari real timestamps
- No-show rate dari actual data

### File yang dibuat/diubah:

- **Baru**: `supabase/functions/create-booking/index.ts`
- **Baru**: `supabase/functions/cancel-booking/index.ts`
- **Edit**: Semua admin pages — real CRUD

---

## Urutan Eksekusi

Karena skala perubahan sangat besar (30+ file, 15+ tabel, 3 role), implementasi harus bertahap:

1. **Pesan ini** → Fase 1 (Database + Auth + Login)
2. **Pesan berikut** → Fase 2 (Data hooks + page updates)
3. **Pesan berikut** → Fase 3 (Driver realtime)
4. **Pesan berikut** → Fase 4 (Admin CRUD + Edge Functions)

Apakah rencana ini disetujui? Saya akan mulai dari **Fase 1**: setup Supabase connection, buat migration schema, implementasi auth dengan 3 role, dan halaman login.