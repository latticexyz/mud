type PartialLog = { readonly blockNumber: bigint | null; readonly logIndex: number | null };

export function logSort(a: PartialLog, b: PartialLog): number {
  if (a.blockNumber === b.blockNumber) {
    if (a.logIndex === b.logIndex) return 0;
    if (a.logIndex == null) return 1;
    if (b.logIndex == null) return -1;
    return a.logIndex - b.logIndex;
  }

  if (a.blockNumber == null) return 1;
  if (b.blockNumber == null) return -1;
  if (a.blockNumber > b.blockNumber) return 1;
  if (a.blockNumber < b.blockNumber) return -1;
  return 0;
}
