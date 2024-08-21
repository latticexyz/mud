import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function camelCase(str: string) {
  const a = str.toLowerCase().replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
  return a.substring(0, 1).toLowerCase() + a.substring(1);
}
