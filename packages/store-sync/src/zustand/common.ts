import { Table } from "@latticexyz/config";
import { SchemaToPrimitives, getKeySchema, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { Hex } from "viem";

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
  readonly key: SchemaToPrimitives<getSchemaTypes<getKeySchema<table>>>;
  readonly value: SchemaToPrimitives<getSchemaTypes<getValueSchema<table>>>;
};
