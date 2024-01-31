import { stringToHex } from "viem";
import { Table } from "../common";
import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "./encodeEntity";

export function getTableEntity(table: Pick<Table, "address" | "namespace" | "name">): Entity {
  return encodeEntity(
    { address: "address", namespace: "bytes16", name: "bytes16" },
    {
      address: table.address,
      namespace: stringToHex(table.namespace, { size: 16 }),
      name: stringToHex(table.name, { size: 16 }),
    }
  );
}
