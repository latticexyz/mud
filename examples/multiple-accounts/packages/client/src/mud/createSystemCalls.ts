/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls() {
  return {};
}
