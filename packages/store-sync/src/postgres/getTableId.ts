import { getAddress } from "viem";

export function getTableId(address: string, namespace: string, tableName: string): string {
  return `${getAddress(address)}:${namespace}:${tableName}`;
}
