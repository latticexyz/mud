import { StaticAbiType, staticAbiTypeToByteLength } from "@latticexyz/schema-type/internal";

export function staticDataLength(staticFields: readonly StaticAbiType[]): number {
  return staticFields.reduce((length, fieldType) => length + staticAbiTypeToByteLength[fieldType], 0);
}
