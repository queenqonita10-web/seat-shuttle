

# Optimasi Tampilan Mobile untuk Semua Halaman User

## Masalah
Beberapa halaman user (Tickets, Profile, TicketDetail) menggunakan layout desktop-oriented dengan `max-w-4xl`, grid multi-kolom, padding besar, dan rounded corners berlebihan. Halaman lain (Index, SearchResults, Checkout, SeatSelection, ETicket) sudah mobile-first dengan `max-w-md`.

## Perubahan

### 1. `Tickets.tsx` — Redesign mobile-first
- Ganti `max-w-4xl` → `max-w-md`, kurangi header padding (`pb-32` → `pb-8`)
- Ticket cards: kurangi `rounded-[2.5rem]` → `rounded-xl`, `p-8` → `p-4`
- Info grid: `grid-cols-2` saja (hapus `md:grid-cols-4`)
- Hapus right-side chevron panel (desktop-only element)
- Filter pills: ukuran lebih kecil, mobile-friendly
- Tambahkan `BottomNav`

### 2. `Profile.tsx` — Redesign mobile-first
- Ganti `max-w-4xl` → `max-w-md`
- Hapus `md:grid-cols-3` sidebar layout → single column stack
- Pindahkan settings nav ke horizontal pills atau accordion di bawah profile info
- Kurangi avatar size `h-32 w-32` → `h-20 w-20`
- Form inputs: single column, kurangi padding
- Tambahkan `BottomNav`

### 3. `TicketDetail.tsx` — Pastikan mobile-friendly
- Ganti `max-w-4xl` → `max-w-md` jika ada
- Pastikan single column layout
- Tambahkan `BottomNav` jika belum ada

### 4. `DriverTracking.tsx` — Tambah BottomNav
- Pastikan ada `BottomNav` dan layout konsisten `max-w-md`

## Prinsip Desain
- Semua halaman user: `max-w-md mx-auto`, padding `px-4` atau `px-5`
- `BottomNav` di semua halaman user (dengan `pb-20` untuk spacing)
- Card corners: `rounded-xl` atau `rounded-lg` (bukan `rounded-[2.5rem]`)
- Font sizes dan padding sesuai layar 375px-414px
- Single column layout, tidak ada grid multi-kolom

## File yang Diubah
- `src/pages/Tickets.tsx`
- `src/pages/Profile.tsx`
- `src/pages/TicketDetail.tsx`
- `src/pages/DriverTracking.tsx`

