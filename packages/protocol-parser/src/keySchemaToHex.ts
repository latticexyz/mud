import { isStaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { KeySchema } from "./common";
import { schemaToHex } from "./schemaToHex";

export function keySchemaToHex(keySchema: KeySchema): Hex {
  return schemaToHex({ staticFields: Object.values(keySchema).filter(isStaticAbiType), dynamicFields: [] });
}
