import { StaticAbiType } from "./schemaAbiTypes";
import { isStaticAbiType } from "./staticAbiTypes";

export type ArrayAbiType = `${StaticAbiType}[]`;
export type FixedArrayAbiType = `${StaticAbiType}[${number}]`;

const arrayPattern = /\[\]$/;
const fixedArrayPattern = /\[\d+\]$/;

export type ArrayAbiTypeToStaticAbiType<T extends string> = T extends `${infer StaticAbiType}[]`
  ? StaticAbiType
  : never;

export type FixedArrayAbiTypeToStaticAbiType<T extends string> = T extends `${infer StaticAbiType}[${number}]`
  ? StaticAbiType
  : never;

export function isArrayAbiType<T extends ArrayAbiType>(abiType: string): abiType is T {
  return arrayPattern.test(abiType) && isStaticAbiType(abiType.replace(arrayPattern, ""));
}

export function isFixedArrayAbiType<T extends FixedArrayAbiType>(abiType: string): abiType is T {
  return fixedArrayPattern.test(abiType) && isStaticAbiType(abiType.replace(fixedArrayPattern, ""));
}

export function arrayAbiTypeToStaticAbiType<T extends ArrayAbiType>(abiType: T): ArrayAbiTypeToStaticAbiType<T> {
  return abiType.replace(arrayPattern, "") as ArrayAbiTypeToStaticAbiType<T>;
}

export function fixedArrayAbiTypeToStaticAbiType<T extends FixedArrayAbiType>(
  abiType: T,
): FixedArrayAbiTypeToStaticAbiType<T> {
  return abiType.replace(fixedArrayPattern, "") as FixedArrayAbiTypeToStaticAbiType<T>;
}

export type fixedArrayToArray<T extends FixedArrayAbiType> = T extends `${infer staticAbiType}[${number}]`
  ? `${staticAbiType}[]`
  : never;

export function fixedArrayToArray<T extends FixedArrayAbiType>(abiType: T): fixedArrayToArray<T> {
  return abiType.replace(fixedArrayPattern, "[]") as fixedArrayToArray<T>;
}
