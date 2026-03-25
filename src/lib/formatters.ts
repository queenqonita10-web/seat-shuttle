// Pure utility functions — no database dependency

export interface PickupPointData {
  id: string;
  label: string;
  sort_order: number;
  time_offset: number;
  fare: number;
  route_id?: string;
}

export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function getPickupTime(departureTime: string, pickupPoint: { timeOffset?: number; time_offset?: number }): string {
  const [h, m] = departureTime.split(":").map(Number);
  const offset = pickupPoint.timeOffset ?? pickupPoint.time_offset ?? 0;
  const total = h * 60 + m + offset;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function getSeatPosition(row: number, col: number, layout: string[][]): string {
  const rowLayout = layout[row];
  if (!rowLayout) return "";
  const seatCols = rowLayout.reduce<number[]>((acc, cell, i) => {
    if (cell === "seat") acc.push(i);
    return acc;
  }, []);
  const idx = seatCols.indexOf(col);
  if (seatCols.length <= 1) return "Single";
  if (idx === 0) return "Window";
  if (idx === seatCols.length - 1) return "Window";
  return "Aisle";
}
