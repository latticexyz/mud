// JSON.stringify but with BigInt support

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize(obj: any) {
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}
