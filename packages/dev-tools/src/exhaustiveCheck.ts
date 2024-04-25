export function exhaustiveCheck(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}
