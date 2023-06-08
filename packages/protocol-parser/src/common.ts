import { Hex } from "viem";
import { DynamicAbiType } from "./dynamicAbiTypes";
import { StaticAbiType } from "./staticAbiTypes";

export type Schema = Readonly<{
  staticDataLength: number;
  staticFields: StaticAbiType[];
  dynamicFields: DynamicAbiType[];
  rawSchema: Hex;
  isEmpty: boolean;
}>;

export type TableSchema = { keySchema: Schema; valueSchema: Schema; isEmpty: boolean; rawSchema: Hex };
