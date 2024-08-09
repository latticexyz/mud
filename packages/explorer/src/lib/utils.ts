import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function camelCase(input: string): string {
  const words = input.toLowerCase().match(/[a-z0-9]+/g);
  if (!words) return "";

  return words.reduce((result, word, index) => {
    if (index === 0) {
      return word;
    }
    return result + word.charAt(0).toUpperCase() + word.slice(1);
  }, "");
}
