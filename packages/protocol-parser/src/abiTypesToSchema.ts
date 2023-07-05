import { DynamicAbiType, SchemaAbiType, StaticAbiType, isDynamicAbiType } from "@latticexyz/schema-type";
import { Schema } from "./common";

export function abiTypesToSchema(abiTypes: SchemaAbiType[]): Schema {
  const staticFields: StaticAbiType[] = [];
  const dynamicFields: DynamicAbiType[] = [];
  for (const abiType of abiTypes) {
    if (isDynamicAbiType(abiType)) dynamicFields.push(abiType);
    else staticFields.push(abiType);
  }
  return { staticFields, dynamicFields };
}
