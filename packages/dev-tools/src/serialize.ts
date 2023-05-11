// JSON.stringify but with BigInt support

export function serialize(obj: any) {
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}
