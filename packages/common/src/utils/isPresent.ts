export function isPresent<T>(argument: T | null | undefined): argument is T {
  return argument !== null && argument !== undefined;
}
