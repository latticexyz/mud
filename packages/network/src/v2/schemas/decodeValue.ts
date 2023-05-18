import {
  AbiType,
  AbiTypeToPrimitiveType,
  DynamicAbiType,
  DynamicAbiTypes,
  SchemaType,
  SchemaTypeToPrimitiveType,
  StaticAbiType,
  StaticAbiTypes,
} from "@latticexyz/schema-type";
import { decodeDynamicField } from "./decodeDynamicField";
import { decodeStaticField } from "./decodeStaticField";

export function decodeValueJSON(bytes: Uint8Array): any {
  return JSON.parse(new TextDecoder().decode(bytes));
}

// TODO: figure out how to switch back to `valueType: never` for exhaustiveness check
const unsupportedValueType = (valueType: AbiType): never => {
  throw new Error(`Unsupported value type: ${valueType}`);
};

export function decodeValue<T extends AbiType, P extends AbiTypeToPrimitiveType<T>>(
  valueType: T,
  bytes: Uint8Array
): P {
  if (StaticAbiTypes.includes(valueType as StaticAbiType)) {
    return decodeStaticField(valueType as StaticAbiType, bytes, 0) as P;
  }
  if (DynamicAbiTypes.includes(valueType as DynamicAbiType)) {
    return decodeDynamicField(valueType as DynamicAbiType, bytes) as P;
  }
  return unsupportedValueType(valueType);
}
