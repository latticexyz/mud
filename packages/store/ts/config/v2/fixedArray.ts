import { StaticAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";

export type FixedArrayAbiType = `${StaticAbiType}[${number}]`;

const fixedArrayAbiTypePattern = /^(\w+)(\[\d+\])$/;

export function isFixedArrayAbiType(internalType: string): internalType is FixedArrayAbiType {
  const [, staticAbiType] = internalType.match(fixedArrayAbiTypePattern) ?? [];
  return isStaticAbiType(staticAbiType);
}

export type fixedArrayToStaticAbiType<fixedArray extends FixedArrayAbiType> =
  fixedArray extends `${infer staticAbiType}[${number}]` ? staticAbiType : never;

export function fixedArrayToStaticAbiType<fixedArray extends FixedArrayAbiType>(
  fixedArray: fixedArray,
): fixedArrayToStaticAbiType<fixedArray> {
  return fixedArray.replace(fixedArrayAbiTypePattern, "$1") as fixedArrayToStaticAbiType<fixedArray>;
}
