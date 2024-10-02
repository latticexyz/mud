import { StorageAdapterBlock } from "./common";

export function isStorageAdapterBlock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string } {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}
