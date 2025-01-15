export function isArrayEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
