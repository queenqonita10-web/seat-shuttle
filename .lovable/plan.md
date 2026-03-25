

# Review: ETicket, DriverTracking, SeatSelection, DriverTripOverview

## Temuan

### 1. `DriverTripOverview.tsx` (536 baris) — Terlalu besar & UI berlebihan
- **Tombol ARRIVED `h-24` (96px)** terlalu besar, memakan ruang layar
- **`rounded-[3rem]`** berlebihan di dialog dan map container
- **`text-3xl`** untuk tombol, `text-2xl` untuk label — terlalu besar di mobile 375px
- **Grid `grid-cols-3`** di dialog verifikasi lokasi — terlalu sempit di mobile
- **Floating events `fixed top-80`** bisa overlap dengan header sticky
- **Bottom bar `pb-40`** terlalu besar

### 2. Route duplikat `/tracking` dan `/track`
- Kedua route mengarah ke `DriverTracking` — sebaiknya hapus salah satu atau redirect

### 3. `ETicket.tsx` — Minor
- Sudah baik. Satu masalah: jika booking hilang (refresh), langsung redirect tanpa feedback

### 4. `SeatSelection.tsx` — OK
- Layout sudah mobile-first, bottom bar sesuai alur booking

### 5. `DriverTracking.tsx` — OK
- Fallback state ada, BottomNav ada, layout konsisten

## Rencana Perbaikan

### 1. Refactor `DriverTripOverview.tsx` — Mobile optimization
- Tombol ARRIVED: `h-24` → `h-16`, `text-3xl` → `text-xl`
- Dialog verifikasi: `rounded-[3rem]` → `rounded-2xl`, `grid-cols-3` → layout lebih mobile-friendly
- Map container: `rounded-[3rem]` → `rounded-2xl`, `h-[500px]` → `h-[360px]`
- Bottom bar padding: `pb-40` → `pb-28`, `p-6` → `p-4`
- Floating events: `fixed top-80` → `sticky` atau `absolute` dalam container
- Kurangi ukuran font heading dari `text-3xl` → `text-xl`, progress counter `text-4xl` → `text-2xl`

### 2. Hapus route duplikat `/tracking`
- Hapus route `/tracking` di `App.tsx`, pertahankan `/track` saja
- Pastikan semua navigasi mengarah ke `/track`

### 3. `ETicket.tsx` — Perbaikan minor
- Gunakan `useEffect` untuk redirect (bukan render-time navigate) agar tidak error React

## File yang Diubah
- `src/pages/driver/DriverTripOverview.tsx` — mobile UI optimization
- `src/App.tsx` — hapus route duplikat `/tracking`
- `src/pages/ETicket.tsx` — fix redirect pattern

