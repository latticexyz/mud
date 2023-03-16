// TODO: migrate to viem's isHex()
// Note that this assumes hex pairs, but viem does not. We'll need to be careful migrating.
// Padding an odd-length hex sounds scary (based on how Solidity left/right aligns numbers vs bytes/strings).
export function isHex(hex: string): boolean {
  return /^(0x)?([\da-f]{2})*$/i.test(hex);
}
