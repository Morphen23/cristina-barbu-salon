import { schedule } from "./config";

export type SlotStatus = "available" | "occupied" | "past";

export type TimeSlot = {
  time: string;
  status: SlotStatus;
};

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isWorkingDay(date: Date): boolean {
  return schedule.days[date.getDay()] !== null;
}

export type OccupiedRange = {
  start: string;
  durationMinutes: number;
};

export function generateSlotsForDate(
  date: Date,
  durationMinutes: number,
  occupied: OccupiedRange[],
): TimeSlot[] {
  const daySchedule = schedule.days[date.getDay()];
  if (!daySchedule) return [];

  const open = parseTime(daySchedule.open);
  const close = parseTime(daySchedule.close);
  const interval = schedule.slotIntervalMinutes;
  const slots: TimeSlot[] = [];

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const occupiedRanges = occupied.map((o) => ({
    start: parseTime(o.start),
    end: parseTime(o.start) + o.durationMinutes,
  }));

  for (let t = open; t + durationMinutes <= close; t += interval) {
    const time = formatTime(t);
    const slotEnd = t + durationMinutes;

    let status: SlotStatus = "available";

    if (isToday && t <= currentMinutes) {
      status = "past";
    } else {
      const overlaps = occupiedRanges.some(
        (range) => t < range.end && slotEnd > range.start,
      );
      if (overlaps) status = "occupied";
    }

    slots.push({ time, status });
  }

  return slots;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getBookableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= schedule.maxDaysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (isWorkingDay(date)) dates.push(date);
  }

  return dates;
}
