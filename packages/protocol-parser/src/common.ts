import { Hex } from "viem";
import { DynamicAbiType, DynamicPrimitiveType, StaticAbiType, StaticPrimitiveType } from "@latticexyz/schema-type";

export type Schema = Readonly<{
  staticDataLength: number;
  staticFields: StaticAbiType[];
  dynamicFields: DynamicAbiType[];
  isEmpty: boolean;
  schemaData: Hex;
  decodeData: (data: Hex) => (StaticPrimitiveType | DynamicPrimitiveType)[];
  decodeField: (fieldIndex: number, data: Hex) => StaticPrimitiveType | DynamicPrimitiveType;
}>;

export type TableSchema = { keySchema: Schema; valueSchema: Schema; isEmpty: boolean; schemaData: Hex };
