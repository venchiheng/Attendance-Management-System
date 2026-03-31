import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateIsLate(checkInTime: Date, shiftStartTime: string) {
  const [hours, minutes] = shiftStartTime.split(':').map(Number);
  const shiftDate = new Date(checkInTime);
  shiftDate.setHours(hours, minutes, 0, 0);

  return checkInTime > shiftDate;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}