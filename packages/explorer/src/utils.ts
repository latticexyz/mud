import { formatEther } from "viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => String(this);
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "");
}

export function formatBalance(wei: bigint) {
  const formatted = formatEther(wei);
  const magnitude = Math.floor(parseFloat(formatted)).toString().length;
  return parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: Math.max(0, 6 - magnitude) });
}

export function isPromiseFulfilled<T>(result: Partial<PromiseSettledResult<T>>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}
