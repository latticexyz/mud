/**
 * For positive inputs: returns the greatest integer less than or equal to its numeric argument.
 * For negative inputs: returns the smallest integer greater than or equal to its numeric argument.
 *
 * @param x A numeric expression.
 * @returns Input rounded towards zero.
 */
export function roundTowardsZero(x: number) {
  const sign = x < 0 ? -1 : 1;
  return sign * Math.floor(Math.abs(x));
}
