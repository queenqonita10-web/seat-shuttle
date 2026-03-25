

# Review Modul Driver & Halaman Baru

## Status Saat Ini

Semua 5 route driver (`/driver`, `/driver/trip`, `/driver/pickup`, `/driver/scan`, `/driver/summary`) sudah memiliki halaman. Navigasi antar halaman juga konsisten. Tidak ada route yang mengarah ke halaman yang tidak ada.

**Namun**, modul driver hanya mencakup alur trip aktif. Fitur pendukung yang dibutuhkan driver sehari-hari belum tersedia:

1. **Riwayat Trip** -- Dashboard menampilkan "Today's Progress 0/3" tapi tidak ada halaman untuk melihat riwayat trip sebelumnya
2. **Detail Pendapatan** -- Dashboard menampilkan "Daily Income Rp 0" tapi tidak bisa diklik untuk melihat breakdown
3. **Profil Driver** -- Tidak ada halaman pengaturan akun driver (nama, kendaraan, shift)

## Rencana: Tambah 3 Halaman Baru

### 1. `/driver/history` — Riwayat Trip
- List trip yang sudah selesai (dari mockData)
- Setiap item menampilkan: tanggal, rute, jumlah PAX, status
- Filter: Hari ini / Minggu ini / Bulan ini
- Navigasi dari tombol "Today's Progress" di Dashboard

### 2. `/driver/earnings` — Detail Pendapatan
- Ringkasan pendapatan: Hari ini, Minggu ini, Bulan ini
- List breakdown per trip (rute, jumlah PAX, pendapatan)
- Simple bar chart mingguan menggunakan div bars
- Navigasi dari tombol "Daily Income" di Dashboard

### 3. `/driver/profile` — Profil & Pengaturan Driver
- Info driver: nama, foto placeholder, rating, total trip
- Pengaturan: driving mode default, wait limit, notifikasi
- Tombol logout / go offline
- Navigasi dari header Dashboard (tambah icon profil)

### 4. Update `DriverDashboard.tsx`
- Buat "Today's Progress" dan "Daily Income" navigasi ke `/driver/history` dan `/driver/earnings`
- Tambah tombol profil di header

### 5. Update `App.tsx`
- Tambah 3 route baru di dalam `/driver`

## File yang Dibuat/Diubah
- **Baru**: `src/pages/driver/DriverHistory.tsx`
- **Baru**: `src/pages/driver/DriverEarnings.tsx`
- **Baru**: `src/pages/driver/DriverProfile.tsx`
- **Edit**: `src/pages/driver/DriverDashboard.tsx` — tambah navigasi
- **Edit**: `src/App.tsx` — tambah 3 route

