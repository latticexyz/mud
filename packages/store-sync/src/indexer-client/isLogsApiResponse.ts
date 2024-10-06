import { StorageAdapterBlock } from "../common";

export type LogsApiResponse = Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string };

export function isLogsApiResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is LogsApiResponse {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}
