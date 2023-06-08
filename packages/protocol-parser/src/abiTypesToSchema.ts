import { Schema } from "./common";
import { DynamicAbiType } from "./dynamicAbiTypes";
import { StaticAbiType, staticAbiTypeToByteLength } from "./staticAbiTypes";
import { abiTypesToRawSchema } from "./abiTypesToRawSchema";

export function abiTypesToSchema(staticFields: StaticAbiType[], dynamicFields: DynamicAbiType[] = []): Schema {
  const staticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  return {
    staticDataLength,
    staticFields,
    dynamicFields,
    isEmpty: false,
    rawSchema: abiTypesToRawSchema(staticFields, dynamicFields),
  };
}
