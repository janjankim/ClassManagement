import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function formatMatchDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  const [, month, day] = dateStr.split("-");
  return `${Number(month)}/${Number(day)} (${WEEKDAYS[date.getDay()]})`;
}
