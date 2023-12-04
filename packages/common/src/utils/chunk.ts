export function* chunk<T>(arr: readonly T[], n: number): Generator<readonly T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
