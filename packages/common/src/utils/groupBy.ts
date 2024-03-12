export function groupBy<value, key>(
  values: readonly value[],
  getKey: (value: value) => key,
): Map<key, readonly value[]> {
  const map = new Map<key, readonly value[]>();
  for (const value of values) {
    const key = getKey(value);
    if (!map.has(key)) map.set(key, []);
    (map.get(key) as value[]).push(value);
  }
  return map;
}
