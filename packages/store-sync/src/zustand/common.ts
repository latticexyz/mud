import { Table, SchemaToPrimitives } from "@latticexyz/store";
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

export type TableRecord<table extends Table> = {
  /** Internal unique ID */
  readonly id: string;
  readonly table: table;
  readonly keyTuple: readonly Hex[];
  readonly key: SchemaToPrimitives<table["keySchema"]>;
  readonly value: SchemaToPrimitives<table["valueSchema"]>;
};
