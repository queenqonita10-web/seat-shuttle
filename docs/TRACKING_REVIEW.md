# Review Business Logic: Driver Tracking System (/track)

Dokumentasi ini merangkum hasil review menyeluruh terhadap alur data dan logika bisnis pada fitur pelacakan Driver PYU-GO.

## 1. Analisis Alur Data & Validasi Input

### Temuan:
- **Validasi Koordinat**: Fungsi `validateCoordinates` saat ini hanya mengecek rentang angka (-90 s/d 90). Belum ada pengecekan tipe data yang ketat di level runtime.
- **Validasi Timestamp**: Tidak ada validasi untuk format ISO 8601 atau pengecekan apakah timestamp berada di masa depan (*future date*).
- **ID Driver**: Validasi `driver_id` hanya mengecek string kosong, tanpa memverifikasi keberadaan driver tersebut di database/mock data.

### Risiko:
- Data sampah (garbage data) dapat masuk ke sistem jika koordinat atau timestamp tidak valid.
- Potensi manipulasi data jika driver dapat mengirimkan lokasi untuk ID driver lain.

## 2. Proses Bisnis & Integrasi

### Temuan:
- **Status Trip**: Driver saat ini tetap dapat mengirimkan update lokasi meskipun tidak sedang dalam perjalanan aktif (*active trip*).
- **Caching**: Caching menggunakan `localStorage` belum memiliki mekanisme kedaluwarsa (*TTL*). Lokasi lama (stale) bisa dianggap sebagai lokasi terbaru jika tidak ada update baru.
- **Notifikasi**: Integrasi notifikasi masih berupa simulasi komentar kode, belum terhubung ke logika yang dapat dipicu secara nyata.

### Rekomendasi Perbaikan:
1. **Strict Validation**: Tambahkan library atau fungsi pembantu untuk validasi format ISO 8601 dan pastikan koordinat adalah angka valid.
2. **Business Rule Enforcement**: Tambahkan pengecekan apakah driver tersebut memiliki status `active` dan sedang ditugaskan pada sebuah trip sebelum menerima update lokasi.
3. **Cache Expiry**: Tambahkan timestamp kedaluwarsa pada cache lokasi (misal: data dianggap tidak valid jika lebih dari 5 menit tanpa update).
4. **Driver Authentication**: (Simulasi) Pastikan update lokasi hanya diterima dari ID driver yang sedang login.

## 3. Rencana Perbaikan (Action Plan)

| Masalah | Perbaikan | Prioritas |
|---------|-----------|-----------|
| Validasi Timestamp | Tambahkan pengecekan format & future date | High |
| Integritas Trip | Cek status trip sebelum update | High |
| Cache Stale | Tambahkan pengecekan durasi data di cache | Medium |
| Notifikasi | Implementasi pemicu notifikasi simulasi | Low |

---
*Dokumen ini dibuat pada 2026-03-25 sebagai bagian dari standar QA PYU-GO.*
