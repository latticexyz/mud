import { StaticPrimitiveType, DynamicPrimitiveType, DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Address, getAddress } from "viem";

// This is just a fake database for now to get us started without all the SQL adapter stuff, so we can have a working TRPC -> Client pipeline. We'll swap this with a real database/backend later.

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;
export type TableId = `${TableNamespace}:${TableName}`;

export type TableRow = {
  keyTuple: Record<string, StaticPrimitiveType>;
  value: Record<string, StaticPrimitiveType | DynamicPrimitiveType>;
};

export type Table = {
  namespace: TableNamespace;
  name: TableName;
  schema: {
    keyTuple: Record<string, StaticAbiType>;
    value: Record<string, StaticAbiType | DynamicAbiType>;
  };
  rows: TableRow[];
  lastBlockNumber: bigint;
};

export const database = { tables: new Map<WorldId, Map<TableId, Table>>(), lastBlockNumber: -1n };

export const getTables = (chainId: ChainId, address: Address): Table[] => {
  return Array.from(database.tables.get(getWorldId(chainId, address))?.values() ?? []);
};

export const getTable = (
  chainId: ChainId,
  address: Address,
  namespace: TableNamespace,
  name: TableName
): Table | undefined => {
  return database.tables.get(getWorldId(chainId, address))?.get(`${namespace}:${name}`);
};

export const createTable = (chainId: ChainId, address: Address, table: Table): void => {
  const worldId: WorldId = getWorldId(chainId, address);
  const tableId: TableId = `${table.namespace}:${table.name}`;

  const tables = database.tables.get(worldId) ?? new Map<TableId, Table>();
  if (!database.tables.has(worldId)) {
    database.tables.set(worldId, tables);
  }

  if (tables.has(tableId)) {
    // throw new Error(`Table ${tableId} already exists`);
    console.warn(`Table ${tableId} already exists, skipping`);
    return;
  }

  tables.set(tableId, table);
};

export const getWorldId = (chainId: ChainId, address: Address): WorldId => {
  return `${chainId}:${getAddress(address)}`;
};
