/**
 *
 * @param to Upper bound (included)
 * @param from Lower bound (included). Default 0.
 * @returns A random integer between from and to.
 */
export function random(to: number, from = 0): number {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

/**
 * @param array Array to pick a random element from.
 * @returns Random element from the given array.
 */
export function pickRandom<T>(array: [T, ...T[]]): T {
  return array[random(array.length - 1)];
}
