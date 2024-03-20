import { Schema, Table } from "@latticexyz/config";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { Hex } from "viem";

export type schemaToPrimitives<schema extends Schema> = {
  readonly [key in keyof schema]: SchemaAbiTypeToPrimitiveType<schema[key]["type"]>;
};

export type Tables = {
  readonly [k: string]: Table;
};

export type RawRecord = {
  /** Internal unique ID */
  readonly id: string;
  readonly tableId: Hex;
  readonly keyTuple: readonly Hex[];
  readonly staticData: Hex;
  readonly encodedLengths: Hex;
  readonly dynamicData: Hex;
};

export type TableRecord<table extends Table = Table> = {
  /** Internal unique ID */
  readonly id: string;
  readonly table: table;
  readonly keyTuple: readonly Hex[];
  readonly key: schemaToPrimitives<getKeySchema<table>>;
  readonly value: schemaToPrimitives<getValueSchema<table>>;
};
