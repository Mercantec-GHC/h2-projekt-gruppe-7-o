import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toUtcIsoZ(input: string): string {
  const d = new Date(input); // parses the GMT+0200 offset correctly
  return d.toISOString(); // always UTC with 'Z'
}

export function formatDateToLocaleString(
  date?: Date,
  locale = "da-DK",
): string {
  if (!date) return "";
  const formattedDate = date.toLocaleDateString(locale);
  return formattedDate;
}

export function formatCurrency(amount: number, currency = "DKK"): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency,
  }).format(amount);
}
