export function memoize<T>(fn: () => T, isEqual: (a: T, b: T) => boolean): () => T {
  let ref: { current: T } | null = null;
  return () => {
    const current = fn();
    if (ref == null) {
      ref = { current };
    } else if (!isEqual(ref.current, current)) {
      ref.current = current;
    }
    return ref.current;
  };
}
