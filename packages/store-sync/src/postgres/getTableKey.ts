import { getAddress } from "viem";
import { Table } from "../common";
import { hexToResource } from "@latticexyz/common";

export function getTableKey({ address, tableId }: Pick<Table, "address" | "tableId">): string {
  const { namespace, name } = hexToResource(tableId);
  return `${getAddress(address)}:${namespace}:${name}`;
}
