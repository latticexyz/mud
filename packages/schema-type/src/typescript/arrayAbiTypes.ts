import { StaticAbiType } from "./schemaAbiTypes";
import { isStaticAbiType } from "./staticAbiTypes";

export type ArrayAbiType = `${StaticAbiType}[]`;
export type FixedArrayAbiType = `${StaticAbiType}[${number}]`;

const arrayPattern = /\[\]$/;
const fixedArrayPattern = /\[\d+\]$/;

export function isArrayAbiType(abiType: unknown): abiType is ArrayAbiType {
  return (
    typeof abiType === "string" && arrayPattern.test(abiType) && isStaticAbiType(abiType.replace(arrayPattern, ""))
  );
}

export function isFixedArrayAbiType(abiType: unknown): abiType is FixedArrayAbiType {
  return (
    typeof abiType === "string" &&
    fixedArrayPattern.test(abiType) &&
    isStaticAbiType(abiType.replace(fixedArrayPattern, ""))
  );
}
export type arrayToStaticAbiType<abiType extends string> = abiType extends `${infer StaticAbiType}[]`
  ? StaticAbiType
  : never;

export type fixedArrayToStaticAbiType<abiType extends string> = abiType extends `${infer StaticAbiType}[${number}]`
  ? StaticAbiType
  : never;

export function arrayToStaticAbiType<abiType extends ArrayAbiType>(abiType: abiType): arrayToStaticAbiType<abiType> {
  return abiType.replace(arrayPattern, "") as arrayToStaticAbiType<abiType>;
}

export function fixedArrayToStaticAbiType<abiType extends FixedArrayAbiType>(
  abiType: abiType,
): fixedArrayToStaticAbiType<abiType> {
  return abiType.replace(fixedArrayPattern, "") as fixedArrayToStaticAbiType<abiType>;
}

export type fixedArrayToArray<abiType extends FixedArrayAbiType> = abiType extends `${infer staticAbiType}[${number}]`
  ? `${staticAbiType}[]`
  : never;

export function fixedArrayToArray<abiType extends FixedArrayAbiType>(abiType: abiType): fixedArrayToArray<abiType> {
  return abiType.replace(fixedArrayPattern, "[]") as fixedArrayToArray<abiType>;
}
