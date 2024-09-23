import { Table } from "@latticexyz/config";
import { getKeySchema, getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";
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
  readonly key: getSchemaPrimitives<getKeySchema<table>>;
  readonly value: getSchemaPrimitives<getValueSchema<table>>;
  readonly fields: getSchemaPrimitives<table["schema"]>;
};

export type { Table };
