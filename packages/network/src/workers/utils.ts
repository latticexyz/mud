export function getCacheId(chainId: number, worldAddress: string) {
  return `ECSCache-${chainId}-${worldAddress}`;
}
