import { Hex } from "viem";
import { DynamicAbiType } from "./dynamicAbiTypes";
import { StaticAbiType } from "./staticAbiTypes";

export type Schema = Readonly<{
  staticDataLength: number;
  staticFields: StaticAbiType[];
  dynamicFields: DynamicAbiType[];
  isEmpty: boolean;
  schemaData: Hex;
}>;

export type TableSchema = { keySchema: Schema; valueSchema: Schema; isEmpty: boolean; schemaData: Hex };
