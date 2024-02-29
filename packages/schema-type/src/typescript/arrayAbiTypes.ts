import { StaticAbiType } from "./schemaAbiTypes";

const arrayAbiTypePattern = /\[\]$/;

export type ArrayAbiTypeToStaticAbiType<T extends string> = T extends `${infer StaticAbiType}[]`
  ? StaticAbiType
  : never;

export function isArrayAbiType<T extends `${StaticAbiType}[]`>(abiType: string): abiType is T {
  return arrayAbiTypePattern.test(abiType);
}

export function arrayAbiTypeToStaticAbiType<T extends `${StaticAbiType}[]`>(
  abiType: T
): ArrayAbiTypeToStaticAbiType<T> {
  return abiType.replace(arrayAbiTypePattern, "") as ArrayAbiTypeToStaticAbiType<T>;
}
