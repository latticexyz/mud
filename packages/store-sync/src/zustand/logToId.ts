import { concatHex } from "viem";
import { StorageAdapterLog } from "../common";

// TODO: add chain ID?
export function logToId(log: StorageAdapterLog): string {
  return `${log.address}:${log.args.tableId}:${concatHex([...log.args.keyTuple])}`;
}
