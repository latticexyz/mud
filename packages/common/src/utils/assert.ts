export function assert<T>(value: T | undefined, message: string): T {
  if (typeof value === "undefined") {
    throw new Error(message);
  }
  return value;
}
