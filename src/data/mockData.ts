export interface PickupPoint {
  id: string;
  label: string;
  order: number;
  timeOffset: number; // minutes from departure
  fare: number; // fare in Rupiah from this pickup point
}

export interface VehicleType {
  id: string;
  name: string;
  /** Each row is an array of cell types: "seat" | "driver" | "baggage" | "empty" */
  layout: string[][];
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
  vehicleTypeId: string;
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

// Vehicle types based on reference images
export const vehicleTypes: VehicleType[] = [
  {
    id: "minibus-3",
    name: "Mini Bus / SUV",
    layout: [
      ["seat", "driver"],
      ["seat", "seat"],
      ["baggage", "baggage"],
    ],
  },
  {
    id: "minibus-5",
    name: "Mini Bus / SUV (Roof Rack)",
    layout: [
      ["seat", "driver"],
      ["seat", "seat"],
      ["seat", "seat"],
      ["baggage", "baggage"],
    ],
  },
  {
    id: "hiace-10",
    name: "HI ACE",
    layout: [
      ["seat", "empty", "driver"],
      ["seat", "seat", "seat"],
      ["seat", "seat", "seat"],
      ["seat", "seat", "seat"],
      ["baggage", "baggage", "baggage"],
    ],
  },
];

export function getVehicleType(id: string): VehicleType {
  return vehicleTypes.find((v) => v.id === id) ?? vehicleTypes[2];
}

function generateSeatsForVehicle(vehicleTypeId: string): Seat[] {
  const vt = getVehicleType(vehicleTypeId);
  const seats: Seat[] = [];
  let seatNum = 1;
  vt.layout.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === "seat") {
        const isBooked = Math.random() < 0.25;
        seats.push({
          id: `seat-${seatNum}`,
          number: `${seatNum}`,
          row: rowIdx,
          col: colIdx,
          status: isBooked ? "booked" : "available",
        });
        seatNum++;
      }
    });
  });
  return seats;
}

// Per-rayon pickup points with real fares
const rayonAPoints: PickupPoint[] = [
  { id: "J1", label: "J1 - Terminal Utama", order: 1, timeOffset: 0, fare: 0 },
  { id: "J2", label: "J2 - Halte Pasar Baru", order: 2, timeOffset: 3, fare: 700 },
  { id: "J3", label: "J3 - Perumahan Indah", order: 3, timeOffset: 6, fare: 950 },
  { id: "J4", label: "J4 - Simpang Tiga", order: 4, timeOffset: 9, fare: 1200 },
  { id: "J5", label: "J5 - Masjid Al-Ikhlas", order: 5, timeOffset: 12, fare: 1500 },
  { id: "J6", label: "J6 - Sekolah Dasar 01", order: 6, timeOffset: 15, fare: 1800 },
  { id: "J7", label: "J7 - Taman Kota", order: 7, timeOffset: 18, fare: 2100 },
  { id: "J8", label: "J8 - Kantor Pos", order: 8, timeOffset: 21, fare: 2500 },
];

const rayonBPoints: PickupPoint[] = [
  { id: "J5", label: "J5 - Masjid Al-Ikhlas", order: 1, timeOffset: 0, fare: 0 },
  { id: "J6", label: "J6 - Sekolah Dasar 01", order: 2, timeOffset: 3, fare: 600 },
  { id: "J7", label: "J7 - Taman Kota", order: 3, timeOffset: 6, fare: 850 },
  { id: "J8", label: "J8 - Kantor Pos", order: 4, timeOffset: 9, fare: 1100 },
  { id: "J9", label: "J9 - RS Harapan", order: 5, timeOffset: 12, fare: 1400 },
  { id: "J10", label: "J10 - Mall Central", order: 6, timeOffset: 15, fare: 1700 },
  { id: "J11", label: "J11 - Stasiun Kereta", order: 7, timeOffset: 18, fare: 2000 },
  { id: "J12", label: "J12 - Kampus Utara", order: 8, timeOffset: 21, fare: 2300 },
  { id: "J13", label: "J13 - Pertigaan Desa", order: 9, timeOffset: 24, fare: 2600 },
];

const rayonCPoints: PickupPoint[] = [
  { id: "J9", label: "J9 - RS Harapan", order: 1, timeOffset: 0, fare: 0 },
  { id: "J10", label: "J10 - Mall Central", order: 2, timeOffset: 3, fare: 500 },
  { id: "J11", label: "J11 - Stasiun Kereta", order: 3, timeOffset: 6, fare: 800 },
  { id: "J12", label: "J12 - Kampus Utara", order: 4, timeOffset: 9, fare: 1100 },
  { id: "J13", label: "J13 - Pertigaan Desa", order: 5, timeOffset: 12, fare: 1400 },
  { id: "J14", label: "J14 - Lapangan Bola", order: 6, timeOffset: 15, fare: 1700 },
  { id: "J15", label: "J15 - Pasar Minggu", order: 7, timeOffset: 18, fare: 2000 },
  { id: "J16", label: "J16 - Kelurahan Baru", order: 8, timeOffset: 21, fare: 2300 },
  { id: "J17", label: "J17 - Terminal Akhir", order: 9, timeOffset: 24, fare: 2800 },
];

const rayonDPoints: PickupPoint[] = [
  { id: "J1", label: "J1 - Terminal Utama", order: 1, timeOffset: 0, fare: 0 },
  { id: "J3", label: "J3 - Perumahan Indah", order: 2, timeOffset: 5, fare: 800 },
  { id: "J5", label: "J5 - Masjid Al-Ikhlas", order: 3, timeOffset: 10, fare: 1200 },
  { id: "J8", label: "J8 - Kantor Pos", order: 4, timeOffset: 16, fare: 1800 },
  { id: "J10", label: "J10 - Mall Central", order: 5, timeOffset: 22, fare: 2200 },
  { id: "J13", label: "J13 - Pertigaan Desa", order: 6, timeOffset: 28, fare: 2800 },
  { id: "J15", label: "J15 - Pasar Minggu", order: 7, timeOffset: 34, fare: 3200 },
  { id: "J17", label: "J17 - Terminal Akhir", order: 8, timeOffset: 40, fare: 3500 },
];

export const routes: Route[] = [
  { id: "rayon-a", name: "Rayon A", pickupPoints: rayonAPoints, destination: "Kota Barat" },
  { id: "rayon-b", name: "Rayon B", pickupPoints: rayonBPoints, destination: "Kota Timur" },
  { id: "rayon-c", name: "Rayon C", pickupPoints: rayonCPoints, destination: "Kota Selatan" },
  { id: "rayon-d", name: "Rayon D", pickupPoints: rayonDPoints, destination: "Kota Utara" },
];

// All unique pickup points across routes for the Home page selector
export const pickupPoints: PickupPoint[] = [
  { id: "J1", label: "J1 - Terminal Utama", order: 1, timeOffset: 0, fare: 0 },
  { id: "J2", label: "J2 - Halte Pasar Baru", order: 2, timeOffset: 3, fare: 0 },
  { id: "J3", label: "J3 - Perumahan Indah", order: 3, timeOffset: 6, fare: 0 },
  { id: "J4", label: "J4 - Simpang Tiga", order: 4, timeOffset: 9, fare: 0 },
  { id: "J5", label: "J5 - Masjid Al-Ikhlas", order: 5, timeOffset: 12, fare: 0 },
  { id: "J6", label: "J6 - Sekolah Dasar 01", order: 6, timeOffset: 15, fare: 0 },
  { id: "J7", label: "J7 - Taman Kota", order: 7, timeOffset: 18, fare: 0 },
  { id: "J8", label: "J8 - Kantor Pos", order: 8, timeOffset: 21, fare: 0 },
  { id: "J9", label: "J9 - RS Harapan", order: 9, timeOffset: 24, fare: 0 },
  { id: "J10", label: "J10 - Mall Central", order: 10, timeOffset: 27, fare: 0 },
  { id: "J11", label: "J11 - Stasiun Kereta", order: 11, timeOffset: 30, fare: 0 },
  { id: "J12", label: "J12 - Kampus Utara", order: 12, timeOffset: 33, fare: 0 },
  { id: "J13", label: "J13 - Pertigaan Desa", order: 13, timeOffset: 36, fare: 0 },
  { id: "J14", label: "J14 - Lapangan Bola", order: 14, timeOffset: 39, fare: 0 },
  { id: "J15", label: "J15 - Pasar Minggu", order: 15, timeOffset: 42, fare: 0 },
  { id: "J16", label: "J16 - Kelurahan Baru", order: 16, timeOffset: 45, fare: 0 },
  { id: "J17", label: "J17 - Terminal Akhir", order: 17, timeOffset: 48, fare: 0 },
];

export const destinations = ["Kota Barat", "Kota Timur", "Kota Selatan", "Kota Utara"];

export const trips: Trip[] = [
  { id: "trip-1", routeId: "rayon-a", departureTime: "06:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
  { id: "trip-2", routeId: "rayon-a", departureTime: "07:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5") },
  { id: "trip-3", routeId: "rayon-a", departureTime: "09:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
  { id: "trip-4", routeId: "rayon-b", departureTime: "06:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5") },
  { id: "trip-5", routeId: "rayon-b", departureTime: "08:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
  { id: "trip-6", routeId: "rayon-c", departureTime: "07:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
  { id: "trip-7", routeId: "rayon-c", departureTime: "10:00", vehicleTypeId: "minibus-3", seats: generateSeatsForVehicle("minibus-3") },
  { id: "trip-8", routeId: "rayon-d", departureTime: "06:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
  { id: "trip-9", routeId: "rayon-d", departureTime: "08:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5") },
  { id: "trip-10", routeId: "rayon-d", departureTime: "11:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10") },
];

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

export function getFareForPickup(route: Route, pickupPointId: string): number {
  const point = route.pickupPoints.find((p) => p.id === pickupPointId);
  return point?.fare ?? 0;
}

export function getSeatPosition(seat: Seat, vehicleTypeId: string): string {
  const vt = getVehicleType(vehicleTypeId);
  const row = vt.layout[seat.row];
  if (!row) return "";
  const seatCols = row.reduce<number[]>((acc, cell, i) => {
    if (cell === "seat") acc.push(i);
    return acc;
  }, []);
  const idx = seatCols.indexOf(seat.col);
  if (seatCols.length <= 1) return "Single";
  if (idx === 0) return "Window";
  if (idx === seatCols.length - 1) return "Window";
  return "Aisle";
}
