import { formatEther } from "viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function formatBalance(wei: bigint) {
  const formatted = formatEther(wei);
  const magnitude = Math.floor(parseFloat(formatted)).toString().length;
  return parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: Math.max(0, 6 - magnitude) });
}
