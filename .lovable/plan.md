

# Tambah Biodata Pemesan di Checkout (Tanpa Akun)

## Ringkasan
Pemesanan tiket tidak memerlukan akun/login. Sebagai gantinya, tambahkan form biodata penumpang (nama lengkap, no telepon) di halaman Checkout sebelum memilih metode pembayaran. Data ini disimpan di booking dan ditampilkan di e-ticket.

## Perubahan

### 1. Update `Booking` interface (`mockData.ts`)
- Tambah field `passengerPhone: string` pada interface `Booking`

### 2. Update `BookingContext.tsx`
- Tambah `passengerName` dan `passengerPhone` ke `BookingState`
- Tambah setter: `setPassengerName`, `setPassengerPhone`

### 3. Update `Checkout.tsx`
- Tambah card "Data Penumpang" di atas Booking Summary dengan:
  - Input **Nama Lengkap** (required, max 100 karakter)
  - Input **No. Telepon** (required, format Indonesia, max 15 digit)
- Validasi: tombol "Pay Now" disabled jika nama atau telepon kosong
- Simpan nama & telepon ke booking saat bayar

### 4. Update `ETicket.tsx`
- Tampilkan nama penumpang dan no. telepon di detail tiket (icon User dan Phone)

### 5. Update `AdminBookings.tsx`
- Tampilkan kolom telepon di tabel bookings dan detail dialog

## File yang Diubah
- `src/data/mockData.ts` — tambah `passengerPhone` di interface & mock data
- `src/context/BookingContext.tsx` — tambah state nama & telepon
- `src/pages/Checkout.tsx` — form biodata penumpang
- `src/pages/ETicket.tsx` — tampilkan biodata di tiket
- `src/pages/admin/AdminBookings.tsx` — kolom telepon

