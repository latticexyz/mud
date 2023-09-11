import { isDynamicAbiType, isStaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { ValueSchema } from "./common";
import { schemaToHex } from "./schemaToHex";

export function valueSchemaToHex(schema: ValueSchema): Hex {
  return schemaToHex({
    staticFields: Object.values(schema).filter(isStaticAbiType),
    dynamicFields: Object.values(schema).filter(isDynamicAbiType),
  });
}
