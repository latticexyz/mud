/**
 * @param enm Numeric enum
 * @returns Number array containing the enum values
 */
export function numValues(enm: object): number[] {
  const nums: number[] = [];
  for (const val of Object.values(enm)) {
    if (!isNaN(Number(val))) {
      nums.push(Number(val));
    }
  }
  return nums;
}
