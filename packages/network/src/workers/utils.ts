export function getCacheId(namespace: string, chainId: number, worldAddress: string) {
  return `${namespace}-${chainId}-${worldAddress}`;
}
