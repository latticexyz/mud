import { formatEther } from "viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBalance(wei: bigint) {
  const formatted = formatEther(wei);
  const magnitude = Math.floor(parseFloat(formatted)).toString().length;
  return parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: Math.max(0, 6 - magnitude) });
}

export function isPromiseFulfilled<T>(result: Partial<PromiseSettledResult<T>>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

export function capitalize(string: string) {
  return string[0]?.toUpperCase() + string.slice(1);
}
