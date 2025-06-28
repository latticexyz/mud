export function findCause(error: Error, fn?: (error: Error) => boolean): Error | null {
  if (fn?.(error)) return error;
  if (error.cause instanceof Error) return findCause(error.cause, fn);
  return fn ? null : error;
}
