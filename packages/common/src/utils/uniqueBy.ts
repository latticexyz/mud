export function uniqueBy<value, key>(values: readonly value[], getKey: (value: value) => key): readonly value[] {
  const map = new Map<key, value>();
  for (const value of values) {
    map.set(getKey(value), value);
  }
  return Array.from(map.values());
}
