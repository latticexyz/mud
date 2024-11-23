export function uniqueBy<value, key>(values: readonly value[], getKey: (value: value) => key): readonly value[] {
  const map = new Map<key, value>();
  for (const value of values) {
    const key = getKey(value);
    if (!map.has(key)) {
      map.set(key, value);
    }
  }
  return Array.from(map.values());
}
