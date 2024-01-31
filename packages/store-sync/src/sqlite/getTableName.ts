import { getAddress } from "viem";

export function getTableName(address: string, namespace: string, tableName: string): string {
  return `${getAddress(address)}__${namespace}__${tableName}`;
}
