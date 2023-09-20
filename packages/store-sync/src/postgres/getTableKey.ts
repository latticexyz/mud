import { getAddress } from "viem";
import { Table } from "../common";
import { hexToResourceId } from "@latticexyz/common";

export function getTableKey({ address, tableId }: Pick<Table, "address" | "tableId">): string {
  const { namespace, name } = hexToResourceId(tableId);
  return `${getAddress(address)}:${namespace}:${name}`;
}
