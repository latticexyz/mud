import { isDynamicAbiType, isStaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { ValueSchema } from "./common";
import { schemaToHex } from "./schemaToHex";

export function valueSchemaToHex(valueSchema: ValueSchema): Hex {
  return schemaToHex({
    staticFields: Object.values(valueSchema).filter(isStaticAbiType),
    dynamicFields: Object.values(valueSchema).filter(isDynamicAbiType),
  });
}
