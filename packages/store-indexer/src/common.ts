import { DynamicAbiType, DynamicPrimitiveType, StaticAbiType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { Address } from "viem";

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;

export type TableRow = {
  keyTuple: Record<string, StaticPrimitiveType>;
  value: Record<string, StaticPrimitiveType | DynamicPrimitiveType>;
};

export type Table = {
  namespace: TableNamespace;
  name: TableName;
  keyTupleSchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, StaticAbiType | DynamicAbiType>;
  lastBlockNumber: bigint | null;
};

export type TableWithRows = Table & { rows: TableRow[] };
