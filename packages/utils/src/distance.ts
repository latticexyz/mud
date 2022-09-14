/**
 * Compute the Euclidean distance between two points
 * https://en.wikipedia.org/wiki/Euclidean_distance
 * @param a
 * @param b
 * @returns Euclidian distance between a and b
 */
export function euclidean(a: [number, number], b: [number, number]): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
