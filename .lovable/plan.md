

# Review & Refinement Seluruh Aplikasi PYU-GO

## Temuan Masalah

### 1. Halaman tanpa BottomNav
Halaman `SearchResults`, `SeatSelection`, `PickupRoute`, `Checkout`, dan `ETicket` tidak memiliki `BottomNav`. Ini membuat navigasi inkonsisten -- pengguna tidak bisa langsung ke Home/Tickets/Track/Profile dari halaman-halaman tersebut.

### 2. DriverTracking tanpa booking = halaman kosong
Jika user mengakses `/track` tanpa booking aktif (misal dari BottomNav), halaman menampilkan konten kosong tanpa fallback karena `pickup` dan `trip` bernilai null.

### 3. Bottom bar tertutup BottomNav
Di `SeatSelection` dan `PickupRoute`, fixed bottom bar (tombol Continue/Checkout) akan tertindih BottomNav jika ditambahkan. Perlu penyesuaian posisi.

### 4. Padding bawah tidak konsisten
`DriverTracking` menggunakan `pb-6` padahal ada BottomNav (butuh `pb-20`). Beberapa halaman lain juga perlu disesuaikan.

### 5. SearchResults tidak ada BottomNav & back button di header
Alur linear (search → seat → route → checkout → eticket) tidak perlu BottomNav, tapi perlu konsistensi. Sebaiknya halaman-halaman alur booking tetap tanpa BottomNav (karena ada tombol Back), tapi ETicket sebagai halaman akhir perlu BottomNav.

### 6. ETicket: tombol "Track Driver" navigasi ke `/tracking` bukan `/track`
Inkonsisten dengan BottomNav yang mengarah ke `/track`.

## Rencana Perbaikan

### 1. Tambah fallback state di `DriverTracking.tsx`
- Jika tidak ada booking aktif, tampilkan pesan "Belum ada perjalanan aktif" dengan tombol ke Home
- Ubah `pb-6` → `pb-20` agar konten tidak tertutup BottomNav

### 2. Tambah BottomNav di `ETicket.tsx`
- Tambah `BottomNav` dan `pb-20` karena ini halaman akhir alur booking, user perlu navigasi ke halaman lain

### 3. Fix link di `ETicket.tsx`
- Ubah navigasi "Track Driver" dari `/tracking` ke `/track` agar konsisten

### 4. Halaman alur booking (SearchResults, SeatSelection, PickupRoute, Checkout) tetap tanpa BottomNav
- Ini halaman linear dengan tombol Back, BottomNav akan mengganggu alur

### 5. Minor UI polish
- Profile: tab Security/Notif/Payment belum ada kontennya -- tambahkan placeholder sederhana
- DriverTracking: `pb-6` → `pb-20`

## File yang Diubah
- `src/pages/DriverTracking.tsx` — fallback state + fix padding
- `src/pages/ETicket.tsx` — tambah BottomNav + fix link `/track`
- `src/pages/Profile.tsx` — placeholder untuk tab yang belum ada konten

