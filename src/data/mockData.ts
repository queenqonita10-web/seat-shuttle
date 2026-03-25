export interface PickupPoint {
  id: string;
  label: string;
  order: number;
  timeOffset: number; // minutes from departure
  fare: number; // fare in Rupiah from this pickup point
}

export interface SeatLayoutTemplate {
  id: string;
  name: string;
  rows: number;
  cols: number;
  layout: SeatLayoutCell[][];
  createdAt: string;
}

export type SeatLayoutCellType = "seat-regular" | "seat-premium" | "seat-vip" | "driver" | "baggage" | "empty";

export interface SeatLayoutCell {
  type: SeatLayoutCellType;
  seatNumber?: string;
}

export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  layoutTemplateId?: string;
  /** Fallback layout if no template is assigned */
  layout: string[][];
}

export const seatLayoutTemplates: SeatLayoutTemplate[] = [
  {
    id: "template-hiace",
    name: "Standard Hiace (10 Seats)",
    rows: 5,
    cols: 3,
    createdAt: new Date().toISOString(),
    layout: [
      [{ type: "seat-regular", seatNumber: "1" }, { type: "empty" }, { type: "driver" }],
      [{ type: "seat-regular", seatNumber: "2" }, { type: "seat-regular", seatNumber: "3" }, { type: "seat-regular", seatNumber: "4" }],
      [{ type: "seat-regular", seatNumber: "5" }, { type: "seat-regular", seatNumber: "6" }, { type: "seat-regular", seatNumber: "7" }],
      [{ type: "seat-regular", seatNumber: "8" }, { type: "seat-regular", seatNumber: "9" }, { type: "seat-regular", seatNumber: "10" }],
      [{ type: "baggage" }, { type: "baggage" }, { type: "baggage" }],
    ],
  },
  {
    id: "template-suv",
    name: "Luxury SUV (5 Seats)",
    rows: 3,
    cols: 2,
    createdAt: new Date().toISOString(),
    layout: [
      [{ type: "seat-premium", seatNumber: "1" }, { type: "driver" }],
      [{ type: "seat-premium", seatNumber: "2" }, { type: "seat-premium", seatNumber: "3" }],
      [{ type: "baggage" }, { type: "baggage" }],
    ],
  },
];

export interface Route {
  id: string;
  routeCode: string;
  name: string;
  origin: string;
  destination: string;
  distance: number; // in km
  estimatedTime: string; // e.g. "2h 30m"
  status: "active" | "inactive";
  pickupPoints: PickupPoint[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vehicleTypeId: string;
  layoutTemplateId?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  status: "active" | "maintenance" | "inactive";
  assignedRouteId?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  history?: {
    field: string;
    oldValue: string;
    newValue: string;
    date: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  memberSince: string;
  totalTrips: number;
  loyaltyPoints: number;
}

export const currentUser: UserProfile = {
  id: "user-123",
  name: "Budi Pratama",
  email: "budi.pratama@email.com",
  phone: "081234567890",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
  address: "Jl. Merdeka No. 123, Jakarta Selatan",
  memberSince: "2024-01-15T08:00:00Z",
  totalTrips: 24,
  loyaltyPoints: 1250,
};

export interface Ticket {
  id: string;
  bookingId: string;
  tripId: string;
  routeId: string;
  seatNumber: string;
  departureDate: string;
  departureTime: string;
  pickupPointId: string;
  status: "active" | "completed" | "cancelled";
  trackingStatus: "scheduled" | "driver_assigned" | "en_route" | "arrived_at_pickup" | "picked_up" | "arrived_at_destination";
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdate: string;
  };
  history: {
    status: string;
    timestamp: string;
    description: string;
  }[];
}

export const userTickets: Ticket[] = [
  {
    id: "TKT-9901",
    bookingId: "BK-1001",
    tripId: "trip-1",
    routeId: "rayon-a",
    seatNumber: "4",
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: "06:00",
    pickupPointId: "J2",
    status: "active",
    trackingStatus: "en_route",
    currentLocation: {
      lat: -6.2,
      lng: 106.8,
      lastUpdate: new Date().toISOString(),
    },
    history: [
      { status: "scheduled", timestamp: "2026-03-24T10:00:00Z", description: "Tiket berhasil dipesan" },
      { status: "driver_assigned", timestamp: "2026-03-25T05:30:00Z", description: "Driver Budi Santoso telah ditugaskan" },
      { status: "en_route", timestamp: "2026-03-25T05:45:00Z", description: "Kendaraan sedang menuju titik jemput" },
    ]
  },
  {
    id: "TKT-8802",
    bookingId: "BK-1005",
    tripId: "trip-6",
    routeId: "rayon-c",
    seatNumber: "7",
    departureDate: "2026-03-20",
    departureTime: "07:00",
    pickupPointId: "J10",
    status: "completed",
    trackingStatus: "arrived_at_destination",
    history: [
      { status: "scheduled", timestamp: "2026-03-19T14:00:00Z", description: "Tiket berhasil dipesan" },
      { status: "picked_up", timestamp: "2026-03-20T07:15:00Z", description: "Penumpang telah dijemput" },
      { status: "arrived_at_destination", timestamp: "2026-03-20T08:30:00Z", description: "Perjalanan selesai" },
    ]
  },
  {
    id: "TKT-7703",
    bookingId: "BK-1010",
    tripId: "trip-10",
    routeId: "rayon-d",
    seatNumber: "2",
    departureDate: "2026-03-22",
    departureTime: "11:00",
    pickupPointId: "J5",
    status: "cancelled",
    trackingStatus: "scheduled",
    history: [
      { status: "scheduled", timestamp: "2026-03-21T09:00:00Z", description: "Tiket berhasil dipesan" },
      { status: "cancelled", timestamp: "2026-03-21T20:00:00Z", description: "Tiket dibatalkan oleh pengguna" },
    ]
  }
];

export interface AuditLog {
  id: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  module: "ROUTE" | "VEHICLE" | "TRIP" | "BOOKING";
  details: string;
  timestamp: string;
}

export const auditLogs: AuditLog[] = [];

export function addAuditLog(log: Omit<AuditLog, "id" | "timestamp">) {
  auditLogs.push({
    ...log,
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  });
}

export const vehicles: Vehicle[] = [
  {
    id: "V-001",
    vehicleTypeId: "hiace-10",
    brand: "Toyota",
    model: "Hiace Premio",
    year: 2022,
    color: "White",
    licensePlate: "B 1234 ABC",
    status: "active",
    assignedRouteId: "rayon-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "V-002",
    vehicleTypeId: "minibus-5",
    brand: "Isuzu",
    model: "Elf Giga",
    year: 2021,
    color: "Silver",
    licensePlate: "D 5678 XYZ",
    status: "active",
    assignedRouteId: "rayon-b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
  driverId?: string;
  status: "active" | "completed" | "cancelled" | "pending";
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "online" | "offline" | "on_trip";
  avatar?: string;
}

export const drivers: Driver[] = [
  { id: "driver-1", name: "Budi Santoso", phone: "081234567890", status: "on_trip" },
  { id: "driver-2", name: "Agus Setiawan", phone: "081234567891", status: "online" },
  { id: "driver-3", name: "Iwan Fals", phone: "081234567892", status: "offline" },
  { id: "driver-4", name: "Eko Prasetyo", phone: "081234567893", status: "online" },
];

export interface Booking {
  id: string;
  tripId: string;
  seatNumber: string;
  pickupPointId: string;
  passengerName: string;
  passengerPhone: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid";
  status: "pending" | "picked_up" | "no_show";
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
  { 
    id: "rayon-a", 
    routeCode: "RT-A",
    name: "Rayon A", 
    origin: "Terminal Utama",
    destination: "Kota Barat", 
    distance: 45,
    estimatedTime: "1h 30m",
    status: "active",
    pickupPoints: rayonAPoints,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "rayon-b", 
    routeCode: "RT-B",
    name: "Rayon B", 
    origin: "Terminal Utama",
    destination: "Kota Timur", 
    distance: 52,
    estimatedTime: "1h 45m",
    status: "active",
    pickupPoints: rayonBPoints,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "rayon-c", 
    routeCode: "RT-C",
    name: "Rayon C", 
    origin: "Terminal Utama",
    destination: "Kota Selatan", 
    distance: 38,
    estimatedTime: "1h 15m",
    status: "active",
    pickupPoints: rayonCPoints,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "rayon-d", 
    routeCode: "RT-D",
    name: "Rayon D", 
    origin: "Terminal Utama",
    destination: "Kota Utara", 
    distance: 60,
    estimatedTime: "2h 00m",
    status: "active",
    pickupPoints: rayonDPoints,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  { id: "trip-1", routeId: "rayon-a", departureTime: "06:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), driverId: "driver-1", status: "active" },
  { id: "trip-2", routeId: "rayon-a", departureTime: "07:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5"), driverId: "driver-2", status: "pending" },
  { id: "trip-3", routeId: "rayon-a", departureTime: "09:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), status: "pending" },
  { id: "trip-4", routeId: "rayon-b", departureTime: "06:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5"), driverId: "driver-4", status: "active" },
  { id: "trip-5", routeId: "rayon-b", departureTime: "08:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), status: "pending" },
  { id: "trip-6", routeId: "rayon-c", departureTime: "07:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), status: "completed" },
  { id: "trip-7", routeId: "rayon-c", departureTime: "10:00", vehicleTypeId: "minibus-3", seats: generateSeatsForVehicle("minibus-3"), status: "pending" },
  { id: "trip-8", routeId: "rayon-d", departureTime: "06:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), status: "active" },
  { id: "trip-9", routeId: "rayon-d", departureTime: "08:30", vehicleTypeId: "minibus-5", seats: generateSeatsForVehicle("minibus-5"), status: "pending" },
  { id: "trip-10", routeId: "rayon-d", departureTime: "11:00", vehicleTypeId: "hiace-10", seats: generateSeatsForVehicle("hiace-10"), status: "pending" },
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

// ─── Mock Bookings ───

const passengerNames = [
  "Ahmad Fauzi", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari", "Rizki Pratama",
  "Anisa Rahma", "Dian Kusuma", "Fajar Hidayat", "Lina Marlina", "Hendra Wijaya",
  "Putri Ayu", "Rafi Gunawan", "Maya Sari", "Eko Prasetyo", "Nadia Safitri",
];

export const mockBookings: Booking[] = Array.from({ length: 15 }, (_, i) => {
  const trip = trips[i % trips.length];
  const route = routes.find(r => r.id === trip.routeId)!;
  const pickup = route.pickupPoints[Math.floor(Math.random() * route.pickupPoints.length)];
  const availableSeats = trip.seats.filter(s => s.status === "available");
  const seat = availableSeats[i % Math.max(availableSeats.length, 1)] ?? trip.seats[0];
  const daysAgo = Math.floor(i / 3);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `BK-${String(1000 + i)}`,
    tripId: trip.id,
    seatNumber: seat?.number ?? "1",
    pickupPointId: pickup.id,
    passengerName: passengerNames[i],
    passengerPhone: `08${String(1200000000 + i * 11111111).slice(0, 10)}`,
    paymentMethod: i % 3 === 0 ? "Cash" : i % 3 === 1 ? "Transfer" : "QRIS",
    paymentStatus: i % 4 === 0 ? "pending" : "paid",
    status: "pending",
    createdAt: date.toISOString(),
  };
});

export function getAllBookings(): Booking[] {
  return mockBookings;
}

export function getBookingsForTrip(tripId: string): Booking[] {
  return mockBookings.filter((b) => b.tripId === tripId);
}

export function getBookingsForStop(tripId: string, pickupPointId: string): Booking[] {
  return mockBookings.filter((b) => b.tripId === tripId && b.pickupPointId === pickupPointId);
}

export function getRevenueByRoute(): { route: string; revenue: number }[] {
  return routes.map(route => {
    const routeTrips = trips.filter(t => t.routeId === route.id);
    const bookings = mockBookings.filter(b => routeTrips.some(t => t.id === b.tripId));
    const revenue = bookings.reduce((sum, b) => {
      const trip = routeTrips.find(t => t.id === b.tripId)!;
      const r = routes.find(rt => rt.id === trip.routeId)!;
      const fare = getFareForPickup(r, b.pickupPointId);
      return sum + fare;
    }, 0);
    return { route: route.name, revenue };
  });
}

export function getBookingsByDay(): { day: string; bookings: number }[] {
  const days: { day: string; bookings: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("id-ID", { weekday: "short" });
    const count = mockBookings.filter(b => {
      const bd = new Date(b.createdAt);
      return bd.toDateString() === d.toDateString();
    }).length;
    days.push({ day: dayStr, bookings: count });
  }
  return days;
}
