/**
 * Helper to serialize values that are not natively serializable and therefore not transferrable to the page
 * For now only `bigint` needs serialization.
 */
export function serialize(obj: unknown): string {
  return JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? `bigint(${v.toString()})` : v));
}

/**
 * Helper to deserialize values that were serialized by `serialize` (because they are not natively serializable).
 * For now only `bigint` is serialized and need to be deserialized here.
 */
export function deserialize(blob: string): Record<string, unknown> {
  const obj = JSON.parse(blob);

  // Check whether the value matches the mattern `bigint(${number}n)`
  // (serialization of bigint in `serialize`)
  // and turn it back into a bigint
  const regex = /^bigint\((-?\d+)\)$/; // Regular expression pattern.
  for (const [key, value] of Object.entries(obj)) {
    const match = typeof value === "string" && value.match(regex); // Attempt to match the pattern.
    if (match) {
      obj[key] = BigInt(match[1]);
    }
  }

  return obj;
}
