

# Fix: /admin Stuck & Auth Issues

## Root Cause Analysis

Berdasarkan review session replay dan kode, ada **3 masalah** yang menyebabkan /admin stuck:

### 1. Demo Login Gagal — Email Confirmation Wajib
Session replay menunjukkan user klik tombol "Admin" demo → error "Email not confirmed". Ini karena:
- Demo account belum ada di database
- Kode mencoba `signUp()` lalu langsung `signInWithPassword()`
- Tapi email confirmation belum dimatikan, jadi auto-login gagal
- **Solusi**: Aktifkan auto-confirm email signups agar demo accounts bisa langsung login

### 2. ProtectedRoute Loading Infinite (Stuck Spinner)
User yang BUKAN admin navigasi ke `/admin`:
- ProtectedRoute menunjukkan spinner saat `loading=true`
- Setelah loading selesai, seharusnya redirect ke `/` karena `role !== "admin"`
- Tapi ada race condition di `useAuth.tsx`: `onAuthStateChange` dan `checkSession` bisa saling override, menyebabkan loading state tidak konsisten
- **Solusi**: Perbaiki race condition di useAuth — gunakan satu path untuk initial session check

### 3. Missing Foreign Keys — Admin Queries Error
Database tidak memiliki foreign keys antar tabel (trips→routes, trips→drivers, trips→vehicles). Query relasional di `useAdminTrips`:
```
supabase.from("trips").select("*, routes(id, name), vehicles(...), drivers(...)")
```
akan GAGAL karena Supabase membutuhkan FK relationships untuk joins.
- **Solusi**: Tambah foreign keys via migration

---

## Rencana Perbaikan

### Step 1: Enable Auto-Confirm Email
Aktifkan auto-confirm agar demo accounts dan registrasi bisa langsung login tanpa verifikasi email.

### Step 2: Migration — Add Foreign Keys
Tambah FK constraints:
- `trips.route_id → routes.id`
- `trips.driver_id → drivers.id`
- `trips.vehicle_id → vehicles.id`
- `trips.vehicle_type_id → vehicle_types.id`
- `bookings.trip_id → trips.id`
- `tickets.booking_id → bookings.id`
- `tickets.trip_id → trips.id`
- `tickets.route_id → routes.id`
- `seats.trip_id → trips.id`
- `pickup_points.route_id → routes.id`
- `driver_locations.driver_id → drivers.id`
- `drivers.user_id → auth.users.id`
- `profiles.user_id → auth.users.id`
- `user_roles.user_id → auth.users.id`

### Step 3: Fix useAuth Race Condition
Perbaiki `useAuth.tsx`:
- Jangan fetch role di kedua `checkSession` DAN `onAuthStateChange` — biarkan `onAuthStateChange` yang handle semua
- `checkSession` hanya set loading=false jika tidak ada session (early exit)

### Step 4: Fix Auth.tsx — Role Insert untuk Passenger
Line 117: `registerRole` bisa `"passenger"` tapi `app_role` enum hanya punya `admin`/`driver`. Insert akan error.
- **Solusi**: Jangan insert role untuk passenger (mereka tidak butuh entry di `user_roles`)

### Step 5: Fix Dashboard Query — Active Trips Filter
Dashboard line 36: `trips.filter(t => t.status === "active")` tapi seed data menggunakan status `"pending"` bukan `"active"`.

---

## File yang Diubah (6 file)

| File | Aksi |
|------|------|
| Migration SQL | Add foreign keys |
| `src/hooks/useAuth.tsx` | Fix race condition |
| `src/pages/Auth.tsx` | Fix passenger role insert |
| `src/pages/admin/Dashboard.tsx` | Fix active trips filter |
| Auto-confirm config | Enable via tool |

