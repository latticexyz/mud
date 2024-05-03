export function assertExhaustive(value: never, message?: string): never {
  throw new Error(message ?? `assertExhaustive received unexpected value: ${value}`);
}
