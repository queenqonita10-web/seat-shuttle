export interface PickupPoint {
  id: string;
  label: string;
  order: number;
  timeOffset: number; // minutes from departure
}

export interface Route {
  id: string;
  name: string;
  pickupPoints: PickupPoint[];
  destination: string;
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: "available" | "booked";
}

export interface Trip {
  id: string;
  routeId: string;
  departureTime: string;
  price: number;
  seats: Seat[];
}

export interface Booking {
  id: string;
  tripId: string;
  seatNumber: string;
  pickupPointId: string;
  passengerName: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid";
  createdAt: string;
}

export const pickupPoints: PickupPoint[] = [
  { id: "J1", label: "J1 - Terminal Utama", order: 1, timeOffset: 0 },
  { id: "J2", label: "J2 - Halte Pasar Baru", order: 2, timeOffset: 3 },
  { id: "J3", label: "J3 - Perumahan Indah", order: 3, timeOffset: 6 },
  { id: "J4", label: "J4 - Simpang Tiga", order: 4, timeOffset: 9 },
  { id: "J5", label: "J5 - Masjid Al-Ikhlas", order: 5, timeOffset: 12 },
  { id: "J6", label: "J6 - Sekolah Dasar 01", order: 6, timeOffset: 15 },
  { id: "J7", label: "J7 - Taman Kota", order: 7, timeOffset: 18 },
  { id: "J8", label: "J8 - Kantor Pos", order: 8, timeOffset: 21 },
  { id: "J9", label: "J9 - RS Harapan", order: 9, timeOffset: 24 },
  { id: "J10", label: "J10 - Mall Central", order: 10, timeOffset: 27 },
  { id: "J11", label: "J11 - Stasiun Kereta", order: 11, timeOffset: 30 },
  { id: "J12", label: "J12 - Kampus Utara", order: 12, timeOffset: 33 },
  { id: "J13", label: "J13 - Pertigaan Desa", order: 13, timeOffset: 36 },
  { id: "J14", label: "J14 - Lapangan Bola", order: 14, timeOffset: 39 },
  { id: "J15", label: "J15 - Pasar Minggu", order: 15, timeOffset: 42 },
  { id: "J16", label: "J16 - Kelurahan Baru", order: 16, timeOffset: 45 },
  { id: "J17", label: "J17 - Terminal Akhir", order: 17, timeOffset: 48 },
];

function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  let seatNum = 1;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 4; col++) {
      if (col === 2 && row === 0) continue; // skip for driver area variation
      const isBooked = Math.random() < 0.3;
      seats.push({
        id: `seat-${seatNum}`,
        number: `${seatNum}`,
        row,
        col,
        status: isBooked ? "booked" : "available",
      });
      seatNum++;
    }
  }
  return seats;
}

export const routes: Route[] = [
  { id: "rayon-a", name: "Rayon A", pickupPoints: pickupPoints.slice(0, 8), destination: "Kota Barat" },
  { id: "rayon-b", name: "Rayon B", pickupPoints: pickupPoints.slice(4, 13), destination: "Kota Timur" },
  { id: "rayon-c", name: "Rayon C", pickupPoints: pickupPoints.slice(8, 17), destination: "Kota Selatan" },
  { id: "rayon-d", name: "Rayon D", pickupPoints, destination: "Kota Utara" },
];

export const trips: Trip[] = [
  { id: "trip-1", routeId: "rayon-a", departureTime: "06:00", price: 25000, seats: generateSeats() },
  { id: "trip-2", routeId: "rayon-a", departureTime: "07:30", price: 25000, seats: generateSeats() },
  { id: "trip-3", routeId: "rayon-a", departureTime: "09:00", price: 30000, seats: generateSeats() },
  { id: "trip-4", routeId: "rayon-b", departureTime: "06:30", price: 28000, seats: generateSeats() },
  { id: "trip-5", routeId: "rayon-b", departureTime: "08:00", price: 28000, seats: generateSeats() },
  { id: "trip-6", routeId: "rayon-c", departureTime: "07:00", price: 32000, seats: generateSeats() },
  { id: "trip-7", routeId: "rayon-c", departureTime: "10:00", price: 32000, seats: generateSeats() },
  { id: "trip-8", routeId: "rayon-d", departureTime: "06:00", price: 35000, seats: generateSeats() },
  { id: "trip-9", routeId: "rayon-d", departureTime: "08:30", price: 35000, seats: generateSeats() },
  { id: "trip-10", routeId: "rayon-d", departureTime: "11:00", price: 35000, seats: generateSeats() },
];

export const destinations = ["Kota Barat", "Kota Timur", "Kota Selatan", "Kota Utara"];

export function getRoutesByDestination(destination: string): Route[] {
  return routes.filter((r) => r.destination === destination);
}

export function getTripsByRoute(routeId: string): Trip[] {
  return trips.filter((t) => t.routeId === routeId);
}

export function getAvailableSeats(trip: Trip): number {
  return trip.seats.filter((s) => s.status === "available").length;
}

export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function getPickupTime(departureTime: string, pickupPoint: PickupPoint): string {
  const [h, m] = departureTime.split(":").map(Number);
  const total = h * 60 + m + pickupPoint.timeOffset;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
