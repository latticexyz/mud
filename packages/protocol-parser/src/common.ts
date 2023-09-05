import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";

export type Schema = {
  readonly staticFields: readonly StaticAbiType[];
  readonly dynamicFields: readonly DynamicAbiType[];
};

export type TableSchema = {
  readonly keySchema: Schema; // TODO: refine to set dynamicFields to []
  readonly valueSchema: Schema;
};

export type FieldLayout = {
  readonly staticFieldLengths: readonly number[];
  readonly numDynamicFields: number;
};
