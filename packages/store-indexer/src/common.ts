import {
  DynamicAbiType,
  DynamicPrimitiveType,
  SchemaAbiType,
  SchemaAbiTypeToPrimitiveType,
  StaticAbiType,
  StaticPrimitiveType,
  schemaAbiTypeToDefaultValue,
} from "@latticexyz/schema-type";
import { Address, Hex, getAddress } from "viem";

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;

export type TableRow = {
  keyTuple: Record<string, StaticPrimitiveType>;
  value: Record<string, StaticPrimitiveType | DynamicPrimitiveType>;
};

export type Table = {
  tableId: Hex;
  namespace: TableNamespace;
  name: TableName;
  keyTupleSchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, StaticAbiType | DynamicAbiType>;
  lastUpdatedBlockNumber: bigint | null;
};

export type TableWithRows = Table & { rows: TableRow[] };

export function getWorldId(chainId: ChainId, address: Address): WorldId {
  return `${chainId}:${getAddress(address)}`;
}

export function schemaToDefaults(
  schema: Record<string, SchemaAbiType>
): Record<string, SchemaAbiTypeToPrimitiveType<SchemaAbiType>> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, abiType]) => [key, schemaAbiTypeToDefaultValue[abiType]])
  );
}
