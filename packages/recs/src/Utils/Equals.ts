import { SuperSet } from "./SuperSet";
import { SuperSetMap } from "./SuperSetMap";

type SetEqualsInput<T> = SuperSet<T> | Set<T> | T[] | undefined;
export function setEquals<T>(a: SetEqualsInput<T>, b: SetEqualsInput<T>): boolean {
  function halfEq(_a: SetEqualsInput<T>, _b: SetEqualsInput<T>) {
    if (!_a || !_b) return false;
    for (const val of _a) {
      if (Array.isArray(_b)) {
        if (!_b.includes(val)) return false;
      } else {
        if (!_b.has(val)) return false;
      }
    }
    return true;
  }

  return halfEq(a, b) && halfEq(b, a);
}

type SetMapEqualsInput<K, V> = SuperSetMap<K, V> | Map<K, Set<V>> | [K, Set<V>][] | [K, V[]][] | undefined;
export function setMapEquals<K, V>(a: SetMapEqualsInput<K, V>, b: SetMapEqualsInput<K, V>) {
  function halfEq<K, V>(_a: SetMapEqualsInput<K, V>, _b: SetMapEqualsInput<K, V>) {
    if (!_a || !_b) return false;
    for (const [key, val] of _a) {
      let entry: Set<V> | V[] | undefined;
      if (Array.isArray(_b)) {
        entry = _b[_b.findIndex((e) => e[0] === key)][1];
      } else {
        entry = _b.get(key);
      }
      if (!entry || !setEquals(val, entry)) return false;
    }

    return true;
  }

  return halfEq(a, b) && halfEq(b, a);
}
