// TODO: migrate to viem's isHex()
export function isHex(hex: string): boolean {
  return /^(0x)?([\da-f]{2})*$/i.test(hex);
}
