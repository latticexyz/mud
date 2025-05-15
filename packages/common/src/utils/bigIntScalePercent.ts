export function bigIntScalePercent(value: bigint, percent: number): bigint {
  return (value * BigInt(percent)) / 100n;
}
