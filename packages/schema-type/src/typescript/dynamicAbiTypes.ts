import { Hex } from "viem";
import { DynamicAbiType, dynamicAbiTypes } from "./schemaAbiTypes";
import { LiteralToBroad } from "./utils";

// Variable-length ABI types, where their lengths are encoded by EncodedLengths within the record

export type DynamicPrimitiveType =
  | readonly number[]
  | readonly bigint[]
  | readonly Hex[]
  | readonly boolean[]
  | Hex
  | string;

export const dynamicAbiTypeToDefaultValue = {
  "uint8[]": [] as readonly number[],
  "uint16[]": [] as readonly number[],
  "uint24[]": [] as readonly number[],
  "uint32[]": [] as readonly number[],
  "uint40[]": [] as readonly number[],
  "uint48[]": [] as readonly number[],
  "uint56[]": [] as readonly bigint[],
  "uint64[]": [] as readonly bigint[],
  "uint72[]": [] as readonly bigint[],
  "uint80[]": [] as readonly bigint[],
  "uint88[]": [] as readonly bigint[],
  "uint96[]": [] as readonly bigint[],
  "uint104[]": [] as readonly bigint[],
  "uint112[]": [] as readonly bigint[],
  "uint120[]": [] as readonly bigint[],
  "uint128[]": [] as readonly bigint[],
  "uint136[]": [] as readonly bigint[],
  "uint144[]": [] as readonly bigint[],
  "uint152[]": [] as readonly bigint[],
  "uint160[]": [] as readonly bigint[],
  "uint168[]": [] as readonly bigint[],
  "uint176[]": [] as readonly bigint[],
  "uint184[]": [] as readonly bigint[],
  "uint192[]": [] as readonly bigint[],
  "uint200[]": [] as readonly bigint[],
  "uint208[]": [] as readonly bigint[],
  "uint216[]": [] as readonly bigint[],
  "uint224[]": [] as readonly bigint[],
  "uint232[]": [] as readonly bigint[],
  "uint240[]": [] as readonly bigint[],
  "uint248[]": [] as readonly bigint[],
  "uint256[]": [] as readonly bigint[],

  "int8[]": [] as readonly number[],
  "int16[]": [] as readonly number[],
  "int24[]": [] as readonly number[],
  "int32[]": [] as readonly number[],
  "int40[]": [] as readonly number[],
  "int48[]": [] as readonly number[],
  "int56[]": [] as readonly bigint[],
  "int64[]": [] as readonly bigint[],
  "int72[]": [] as readonly bigint[],
  "int80[]": [] as readonly bigint[],
  "int88[]": [] as readonly bigint[],
  "int96[]": [] as readonly bigint[],
  "int104[]": [] as readonly bigint[],
  "int112[]": [] as readonly bigint[],
  "int120[]": [] as readonly bigint[],
  "int128[]": [] as readonly bigint[],
  "int136[]": [] as readonly bigint[],
  "int144[]": [] as readonly bigint[],
  "int152[]": [] as readonly bigint[],
  "int160[]": [] as readonly bigint[],
  "int168[]": [] as readonly bigint[],
  "int176[]": [] as readonly bigint[],
  "int184[]": [] as readonly bigint[],
  "int192[]": [] as readonly bigint[],
  "int200[]": [] as readonly bigint[],
  "int208[]": [] as readonly bigint[],
  "int216[]": [] as readonly bigint[],
  "int224[]": [] as readonly bigint[],
  "int232[]": [] as readonly bigint[],
  "int240[]": [] as readonly bigint[],
  "int248[]": [] as readonly bigint[],
  "int256[]": [] as readonly bigint[],

  "bytes1[]": [] as readonly Hex[],
  "bytes2[]": [] as readonly Hex[],
  "bytes3[]": [] as readonly Hex[],
  "bytes4[]": [] as readonly Hex[],
  "bytes5[]": [] as readonly Hex[],
  "bytes6[]": [] as readonly Hex[],
  "bytes7[]": [] as readonly Hex[],
  "bytes8[]": [] as readonly Hex[],
  "bytes9[]": [] as readonly Hex[],
  "bytes10[]": [] as readonly Hex[],
  "bytes11[]": [] as readonly Hex[],
  "bytes12[]": [] as readonly Hex[],
  "bytes13[]": [] as readonly Hex[],
  "bytes14[]": [] as readonly Hex[],
  "bytes15[]": [] as readonly Hex[],
  "bytes16[]": [] as readonly Hex[],
  "bytes17[]": [] as readonly Hex[],
  "bytes18[]": [] as readonly Hex[],
  "bytes19[]": [] as readonly Hex[],
  "bytes20[]": [] as readonly Hex[],
  "bytes21[]": [] as readonly Hex[],
  "bytes22[]": [] as readonly Hex[],
  "bytes23[]": [] as readonly Hex[],
  "bytes24[]": [] as readonly Hex[],
  "bytes25[]": [] as readonly Hex[],
  "bytes26[]": [] as readonly Hex[],
  "bytes27[]": [] as readonly Hex[],
  "bytes28[]": [] as readonly Hex[],
  "bytes29[]": [] as readonly Hex[],
  "bytes30[]": [] as readonly Hex[],
  "bytes31[]": [] as readonly Hex[],
  "bytes32[]": [] as readonly Hex[],

  "bool[]": [] as readonly boolean[],
  "address[]": [] as readonly Hex[],

  bytes: "0x",
  string: "",
} as const satisfies Record<DynamicAbiType, DynamicPrimitiveType>;

export type DynamicAbiTypeToPrimitiveType<TDynamicAbiType extends DynamicAbiType = DynamicAbiType> = LiteralToBroad<
  (typeof dynamicAbiTypeToDefaultValue)[TDynamicAbiType]
>;

export function isDynamicAbiType(abiType: unknown): abiType is DynamicAbiType {
  return dynamicAbiTypes.includes(abiType as DynamicAbiType);
}
