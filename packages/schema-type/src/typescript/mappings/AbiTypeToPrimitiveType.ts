import { AbiType, AbiTypeToPrimitiveType as StaticAbiTypeToPrimitiveType } from "abitype";

/**
 * Like abitype's AbiTypeToPrimitiveType but adding support for arrays and using strings as input
 */
export type AbiTypeToPrimitiveType<T extends string> = T extends `${infer StaticAbiType}[${any}]`
  ? StaticAbiType extends AbiType
    ? StaticAbiTypeToPrimitiveType<StaticAbiType>[]
    : never
  : T extends AbiType
  ? StaticAbiTypeToPrimitiveType<T>
  : never;
