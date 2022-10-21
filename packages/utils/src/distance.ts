/**
 * Compute the Euclidean distance between two points
 * https://en.wikipedia.org/wiki/Euclidean_distance
 * @param a
 * @param b
 * @returns Euclidian distance between a and b
 */
export function euclidean(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("points must have same dimension");
  return Math.sqrt(a.reduce((acc, _, i) => acc + Math.pow(a[i] - b[i], 2), 0));
}
