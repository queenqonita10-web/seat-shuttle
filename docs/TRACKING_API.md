# PYU-GO Driver Tracking API Documentation

Dokumentasi ini menjelaskan standar API untuk sistem pelacakan lokasi Driver secara real-time.

## 1. Update Lokasi Driver (Simulated)

Endpoint untuk menerima pembaruan koordinat GPS dari aplikasi Driver.

- **Method**: `POST` (Simulated)
- **Endpoint**: `/api/v1/tracking/update`
- **Validation Rules**:
  - `driver_id`: String (Required)
  - `lat`: Number (-90 to 90)
  - `lng`: Number (-180 to 180)
  - `timestamp`: ISO 8601 String

### Request Body
```json
{
  "driver_id": "DRV-001",
  "lat": -6.2088,
  "lng": 106.8456,
  "timestamp": "2026-03-25T15:00:00Z"
}
```

### Response
```json
{
  "success": true,
  "message": "Lokasi berhasil diperbarui",
  "last_updated": "2026-03-25T15:00:00Z"
}
```

## 2. Ambil Lokasi Terakhir Driver

Mendapatkan koordinat terakhir driver yang tersimpan di cache atau database.

- **Method**: `GET` (Simulated)
- **Endpoint**: `/api/v1/tracking/last-known/:driver_id`

### Response
```json
{
  "driver_id": "DRV-001",
  "lat": -6.2088,
  "lng": 106.8456,
  "timestamp": "2026-03-25T15:00:00Z"
}
```

## Arsitektur & Business Logic

1. **Service Layer**: Implementasi berada di `src/services/trackingService.ts`.
2. **Consistency**: Data divalidasi sebelum disimpan ke cache/database.
3. **Caching**: Menggunakan `localStorage` (simulasi Redis/Memcached) untuk optimasi query lokasi terakhir.
4. **Notifikasi**: Sistem secara otomatis memicu notifikasi ke customer yang memiliki tiket aktif saat lokasi driver diperbarui.
5. **Simulasi**: `DriverContext.tsx` melakukan simulasi pergerakan driver setiap 5 detik saat dalam mode berkendara.
