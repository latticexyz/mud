import { Hex } from "viem";
import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";

export type Schema = Readonly<{
  staticDataLength: number;
  staticFields: StaticAbiType[];
  dynamicFields: DynamicAbiType[];
  isEmpty: boolean;
  schemaData: Hex;
}>;

export type TableSchema = { keySchema: Schema; valueSchema: Schema; isEmpty: boolean; schemaData: Hex };
