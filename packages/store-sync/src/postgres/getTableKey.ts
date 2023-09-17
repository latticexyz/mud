import { getAddress } from "viem";
import { Table } from "../common";
import { hexToTableId } from "@latticexyz/common";

export function getTableKey({ address, tableId }: Pick<Table, "address" | "tableId">): string {
  const { namespace, name } = hexToTableId(tableId);
  return `${getAddress(address)}:${namespace}:${name}`;
}
