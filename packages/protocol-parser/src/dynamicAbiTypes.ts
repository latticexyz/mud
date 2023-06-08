import { StaticAbiType } from "./staticAbiTypes";
import { Hex } from "viem";
import { dynamicAbiTypes } from "./schemaAbiTypes";

// Variable-length ABI types, where their lengths are defined by a PackedCounter

export { dynamicAbiTypes };

export type DynamicAbiType = (typeof dynamicAbiTypes)[number];

export type DynamicPrimitiveType = number[] | bigint[] | Hex[] | boolean[] | Hex | string;

export const dynamicAbiTypeToDefaultValue = {
  "uint8[]": [] as number[],
  "uint16[]": [] as number[],
  "uint24[]": [] as number[],
  "uint32[]": [] as number[],
  "uint40[]": [] as number[],
  "uint48[]": [] as number[],
  "uint56[]": [] as bigint[],
  "uint64[]": [] as bigint[],
  "uint72[]": [] as bigint[],
  "uint80[]": [] as bigint[],
  "uint88[]": [] as bigint[],
  "uint96[]": [] as bigint[],
  "uint104[]": [] as bigint[],
  "uint112[]": [] as bigint[],
  "uint120[]": [] as bigint[],
  "uint128[]": [] as bigint[],
  "uint136[]": [] as bigint[],
  "uint144[]": [] as bigint[],
  "uint152[]": [] as bigint[],
  "uint160[]": [] as bigint[],
  "uint168[]": [] as bigint[],
  "uint176[]": [] as bigint[],
  "uint184[]": [] as bigint[],
  "uint192[]": [] as bigint[],
  "uint200[]": [] as bigint[],
  "uint208[]": [] as bigint[],
  "uint216[]": [] as bigint[],
  "uint224[]": [] as bigint[],
  "uint232[]": [] as bigint[],
  "uint240[]": [] as bigint[],
  "uint248[]": [] as bigint[],
  "uint256[]": [] as bigint[],

  "int8[]": [] as number[],
  "int16[]": [] as number[],
  "int24[]": [] as number[],
  "int32[]": [] as number[],
  "int40[]": [] as number[],
  "int48[]": [] as number[],
  "int56[]": [] as bigint[],
  "int64[]": [] as bigint[],
  "int72[]": [] as bigint[],
  "int80[]": [] as bigint[],
  "int88[]": [] as bigint[],
  "int96[]": [] as bigint[],
  "int104[]": [] as bigint[],
  "int112[]": [] as bigint[],
  "int120[]": [] as bigint[],
  "int128[]": [] as bigint[],
  "int136[]": [] as bigint[],
  "int144[]": [] as bigint[],
  "int152[]": [] as bigint[],
  "int160[]": [] as bigint[],
  "int168[]": [] as bigint[],
  "int176[]": [] as bigint[],
  "int184[]": [] as bigint[],
  "int192[]": [] as bigint[],
  "int200[]": [] as bigint[],
  "int208[]": [] as bigint[],
  "int216[]": [] as bigint[],
  "int224[]": [] as bigint[],
  "int232[]": [] as bigint[],
  "int240[]": [] as bigint[],
  "int248[]": [] as bigint[],
  "int256[]": [] as bigint[],

  "bytes1[]": [] as Hex[],
  "bytes2[]": [] as Hex[],
  "bytes3[]": [] as Hex[],
  "bytes4[]": [] as Hex[],
  "bytes5[]": [] as Hex[],
  "bytes6[]": [] as Hex[],
  "bytes7[]": [] as Hex[],
  "bytes8[]": [] as Hex[],
  "bytes9[]": [] as Hex[],
  "bytes10[]": [] as Hex[],
  "bytes11[]": [] as Hex[],
  "bytes12[]": [] as Hex[],
  "bytes13[]": [] as Hex[],
  "bytes14[]": [] as Hex[],
  "bytes15[]": [] as Hex[],
  "bytes16[]": [] as Hex[],
  "bytes17[]": [] as Hex[],
  "bytes18[]": [] as Hex[],
  "bytes19[]": [] as Hex[],
  "bytes20[]": [] as Hex[],
  "bytes21[]": [] as Hex[],
  "bytes22[]": [] as Hex[],
  "bytes23[]": [] as Hex[],
  "bytes24[]": [] as Hex[],
  "bytes25[]": [] as Hex[],
  "bytes26[]": [] as Hex[],
  "bytes27[]": [] as Hex[],
  "bytes28[]": [] as Hex[],
  "bytes29[]": [] as Hex[],
  "bytes30[]": [] as Hex[],
  "bytes31[]": [] as Hex[],
  "bytes32[]": [] as Hex[],

  "bool[]": [] as boolean[],
  "address[]": [] as Hex[],

  bytes: "0x",
  string: "",
} as const satisfies Record<DynamicAbiType, DynamicPrimitiveType>;

export type DynamicAbiTypeToPrimitiveType<TDynamicAbiType extends DynamicAbiType> =
  (typeof dynamicAbiTypeToDefaultValue)[TDynamicAbiType];

export type ArrayAbiTypeToStaticAbiType<T extends string> = T extends `${infer StaticAbiType}[]`
  ? StaticAbiType
  : never;

export function arrayAbiTypeToStaticAbiType<T extends `${StaticAbiType}[]`>(
  abiType: T
): ArrayAbiTypeToStaticAbiType<T> {
  return abiType.replace(/\[\]$/g, "") as ArrayAbiTypeToStaticAbiType<T>;
}
