import { TableId } from "@latticexyz/utils";
import { Contract } from "ethers";
import { TableMetadata } from "../common";

// worldAddress:tableId => schema
// TODO: add chain ID to namespace?
export const metadata: Partial<Record<`${string}:${string}`, TableMetadata>> = {};

// the Contract arguments below assume that they're bound to a provider

export function getMetadata(world: Contract, table: TableId): TableMetadata | undefined {
  const schemaKey = `${world.address}:${table}` as const;
  return metadata[schemaKey];
}

// TODO: make async with optional metadata and lazily fetch from contract?
export function registerMetadata(world: Contract, table: TableId, tableName: string, fieldNames: string[]) {
  const schemaKey = `${world.address}:${table}` as const;

  if (metadata[schemaKey]) {
    console.warn("metadata already registered for this table", { table, world: world.address });
    return;
  }

  metadata[schemaKey] = { tableName, fieldNames };
}
