import { StaticAbiType, DynamicAbiType, staticAbiTypeToByteLength } from "@latticexyz/schema-type";
import { Schema } from "./common";
import { abiTypesToSchemaData } from "./abiTypesToSchemaData";

export function abiTypesToSchema(staticFields: StaticAbiType[], dynamicFields: DynamicAbiType[] = []): Schema {
  const staticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  return {
    staticDataLength,
    staticFields,
    dynamicFields,
    isEmpty: false,
    schemaData: abiTypesToSchemaData(staticFields, dynamicFields),
  };
}
