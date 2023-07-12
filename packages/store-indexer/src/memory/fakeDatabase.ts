import { Address, getAddress } from "viem";
import { ChainId, Table, TableName, TableNamespace, TableWithRows, WorldId } from "../common";

// This is just a fake database for now to get us started without all the SQL adapter stuff, so we can have a working TRPC -> Client pipeline. We'll swap this with a real database/backend later.

type TableId = `${TableNamespace}:${TableName}`;

export const database = { tables: new Map<WorldId, Map<TableId, TableWithRows>>(), lastBlockNumber: -1n };

export const getTables = (chainId: ChainId, address: Address): TableWithRows[] => {
  return Array.from(database.tables.get(getWorldId(chainId, address))?.values() ?? []);
};

export const getTable = (
  chainId: ChainId,
  address: Address,
  namespace: TableNamespace,
  name: TableName
): TableWithRows | undefined => {
  return database.tables.get(getWorldId(chainId, address))?.get(`${namespace}:${name}`);
};

export const createTable = (chainId: ChainId, address: Address, table: TableWithRows): void => {
  const worldId: WorldId = getWorldId(chainId, address);
  const tableId: TableId = `${table.namespace}:${table.name}`;

  const tables = database.tables.get(worldId) ?? new Map<TableId, TableWithRows>();
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
