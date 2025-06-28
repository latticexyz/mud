import { StorageAdapterBlock } from "../common";
import { LogsApiResponse } from "./isLogsApiResponse";

export function toStorageAdapterBlock(data: LogsApiResponse): StorageAdapterBlock {
  return { ...data, blockNumber: BigInt(data.blockNumber) };
}
