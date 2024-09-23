export function assertExhaustive(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}
