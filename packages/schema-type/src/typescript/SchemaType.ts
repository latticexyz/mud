// WARNING: SchemaType enum MUST mirror the solidity version!
// WARNING: SchemaType methods use hardcoded enum indexes, review them after any changes to the enum
export enum SchemaType {
  UINT8,
  UINT16,
  UINT24,
  UINT32,
  UINT40,
  UINT48,
  UINT56,
  UINT64,
  UINT72,
  UINT80,
  UINT88,
  UINT96,
  UINT104,
  UINT112,
  UINT120,
  UINT128,
  UINT136,
  UINT144,
  UINT152,
  UINT160,
  UINT168,
  UINT176,
  UINT184,
  UINT192,
  UINT200,
  UINT208,
  UINT216,
  UINT224,
  UINT232,
  UINT240,
  UINT248,
  UINT256,
  INT8,
  INT16,
  INT24,
  INT32,
  INT40,
  INT48,
  INT56,
  INT64,
  INT72,
  INT80,
  INT88,
  INT96,
  INT104,
  INT112,
  INT120,
  INT128,
  INT136,
  INT144,
  INT152,
  INT160,
  INT168,
  INT176,
  INT184,
  INT192,
  INT200,
  INT208,
  INT216,
  INT224,
  INT232,
  INT240,
  INT248,
  INT256,
  BYTES1,
  BYTES2,
  BYTES3,
  BYTES4,
  BYTES5,
  BYTES6,
  BYTES7,
  BYTES8,
  BYTES9,
  BYTES10,
  BYTES11,
  BYTES12,
  BYTES13,
  BYTES14,
  BYTES15,
  BYTES16,
  BYTES17,
  BYTES18,
  BYTES19,
  BYTES20,
  BYTES21,
  BYTES22,
  BYTES23,
  BYTES24,
  BYTES25,
  BYTES26,
  BYTES27,
  BYTES28,
  BYTES29,
  BYTES30,
  BYTES31,
  BYTES32,
  BOOL,
  ADDRESS,
  UINT8_ARRAY,
  UINT16_ARRAY,
  UINT24_ARRAY,
  UINT32_ARRAY,
  UINT40_ARRAY,
  UINT48_ARRAY,
  UINT56_ARRAY,
  UINT64_ARRAY,
  UINT72_ARRAY,
  UINT80_ARRAY,
  UINT88_ARRAY,
  UINT96_ARRAY,
  UINT104_ARRAY,
  UINT112_ARRAY,
  UINT120_ARRAY,
  UINT128_ARRAY,
  UINT136_ARRAY,
  UINT144_ARRAY,
  UINT152_ARRAY,
  UINT160_ARRAY,
  UINT168_ARRAY,
  UINT176_ARRAY,
  UINT184_ARRAY,
  UINT192_ARRAY,
  UINT200_ARRAY,
  UINT208_ARRAY,
  UINT216_ARRAY,
  UINT224_ARRAY,
  UINT232_ARRAY,
  UINT240_ARRAY,
  UINT248_ARRAY,
  UINT256_ARRAY,
  INT8_ARRAY,
  INT16_ARRAY,
  INT24_ARRAY,
  INT32_ARRAY,
  INT40_ARRAY,
  INT48_ARRAY,
  INT56_ARRAY,
  INT64_ARRAY,
  INT72_ARRAY,
  INT80_ARRAY,
  INT88_ARRAY,
  INT96_ARRAY,
  INT104_ARRAY,
  INT112_ARRAY,
  INT120_ARRAY,
  INT128_ARRAY,
  INT136_ARRAY,
  INT144_ARRAY,
  INT152_ARRAY,
  INT160_ARRAY,
  INT168_ARRAY,
  INT176_ARRAY,
  INT184_ARRAY,
  INT192_ARRAY,
  INT200_ARRAY,
  INT208_ARRAY,
  INT216_ARRAY,
  INT224_ARRAY,
  INT232_ARRAY,
  INT240_ARRAY,
  INT248_ARRAY,
  INT256_ARRAY,
  BYTES1_ARRAY,
  BYTES2_ARRAY,
  BYTES3_ARRAY,
  BYTES4_ARRAY,
  BYTES5_ARRAY,
  BYTES6_ARRAY,
  BYTES7_ARRAY,
  BYTES8_ARRAY,
  BYTES9_ARRAY,
  BYTES10_ARRAY,
  BYTES11_ARRAY,
  BYTES12_ARRAY,
  BYTES13_ARRAY,
  BYTES14_ARRAY,
  BYTES15_ARRAY,
  BYTES16_ARRAY,
  BYTES17_ARRAY,
  BYTES18_ARRAY,
  BYTES19_ARRAY,
  BYTES20_ARRAY,
  BYTES21_ARRAY,
  BYTES22_ARRAY,
  BYTES23_ARRAY,
  BYTES24_ARRAY,
  BYTES25_ARRAY,
  BYTES26_ARRAY,
  BYTES27_ARRAY,
  BYTES28_ARRAY,
  BYTES29_ARRAY,
  BYTES30_ARRAY,
  BYTES31_ARRAY,
  BYTES32_ARRAY,
  BOOL_ARRAY,
  ADDRESS_ARRAY,
  BYTES,
  STRING,
}

export function getStaticByteLength(schemaType: SchemaType) {
  const val = schemaType.valueOf();
  if (val < 32) {
    // uint8-256
    return val + 1;
  } else if (val < 64) {
    // int8-256, offset by 32
    return val + 1 - 32;
  } else if (val < 96) {
    // bytes1-32, offset by 64
    return val + 1 - 64;
  }

  // Other static types
  if (schemaType == SchemaType.BOOL) {
    return 1;
  } else if (schemaType == SchemaType.ADDRESS) {
    return 20;
  }

  // Return 0 for all dynamic types
  return 0;
}

export const SchemaTypeId: Record<SchemaType, string> = {
  [SchemaType.UINT8]: "uint8",
  [SchemaType.UINT16]: "uint16",
  [SchemaType.UINT24]: "uint24",
  [SchemaType.UINT32]: "uint32",
  [SchemaType.UINT40]: "uint40",
  [SchemaType.UINT48]: "uint48",
  [SchemaType.UINT56]: "uint56",
  [SchemaType.UINT64]: "uint64",
  [SchemaType.UINT72]: "uint72",
  [SchemaType.UINT80]: "uint80",
  [SchemaType.UINT88]: "uint88",
  [SchemaType.UINT96]: "uint96",
  [SchemaType.UINT104]: "uint104",
  [SchemaType.UINT112]: "uint112",
  [SchemaType.UINT120]: "uint120",
  [SchemaType.UINT128]: "uint128",
  [SchemaType.UINT136]: "uint136",
  [SchemaType.UINT144]: "uint144",
  [SchemaType.UINT152]: "uint152",
  [SchemaType.UINT160]: "uint160",
  [SchemaType.UINT168]: "uint168",
  [SchemaType.UINT176]: "uint176",
  [SchemaType.UINT184]: "uint184",
  [SchemaType.UINT192]: "uint192",
  [SchemaType.UINT200]: "uint200",
  [SchemaType.UINT208]: "uint208",
  [SchemaType.UINT216]: "uint216",
  [SchemaType.UINT224]: "uint224",
  [SchemaType.UINT232]: "uint232",
  [SchemaType.UINT240]: "uint240",
  [SchemaType.UINT248]: "uint248",
  [SchemaType.UINT256]: "uint256",

  [SchemaType.INT8]: "int8",
  [SchemaType.INT16]: "int16",
  [SchemaType.INT24]: "int24",
  [SchemaType.INT32]: "int32",
  [SchemaType.INT40]: "int40",
  [SchemaType.INT48]: "int48",
  [SchemaType.INT56]: "int56",
  [SchemaType.INT64]: "int64",
  [SchemaType.INT72]: "int72",
  [SchemaType.INT80]: "int80",
  [SchemaType.INT88]: "int88",
  [SchemaType.INT96]: "int96",
  [SchemaType.INT104]: "int104",
  [SchemaType.INT112]: "int112",
  [SchemaType.INT120]: "int120",
  [SchemaType.INT128]: "int128",
  [SchemaType.INT136]: "int136",
  [SchemaType.INT144]: "int144",
  [SchemaType.INT152]: "int152",
  [SchemaType.INT160]: "int160",
  [SchemaType.INT168]: "int168",
  [SchemaType.INT176]: "int176",
  [SchemaType.INT184]: "int184",
  [SchemaType.INT192]: "int192",
  [SchemaType.INT200]: "int200",
  [SchemaType.INT208]: "int208",
  [SchemaType.INT216]: "int216",
  [SchemaType.INT224]: "int224",
  [SchemaType.INT232]: "int232",
  [SchemaType.INT240]: "int240",
  [SchemaType.INT248]: "int248",
  [SchemaType.INT256]: "int256",

  [SchemaType.BYTES1]: "bytes1",
  [SchemaType.BYTES2]: "bytes2",
  [SchemaType.BYTES3]: "bytes3",
  [SchemaType.BYTES4]: "bytes4",
  [SchemaType.BYTES5]: "bytes5",
  [SchemaType.BYTES6]: "bytes6",
  [SchemaType.BYTES7]: "bytes7",
  [SchemaType.BYTES8]: "bytes8",
  [SchemaType.BYTES9]: "bytes9",
  [SchemaType.BYTES10]: "bytes10",
  [SchemaType.BYTES11]: "bytes11",
  [SchemaType.BYTES12]: "bytes12",
  [SchemaType.BYTES13]: "bytes13",
  [SchemaType.BYTES14]: "bytes14",
  [SchemaType.BYTES15]: "bytes15",
  [SchemaType.BYTES16]: "bytes16",
  [SchemaType.BYTES17]: "bytes17",
  [SchemaType.BYTES18]: "bytes18",
  [SchemaType.BYTES19]: "bytes19",
  [SchemaType.BYTES20]: "bytes20",
  [SchemaType.BYTES21]: "bytes21",
  [SchemaType.BYTES22]: "bytes22",
  [SchemaType.BYTES23]: "bytes23",
  [SchemaType.BYTES24]: "bytes24",
  [SchemaType.BYTES25]: "bytes25",
  [SchemaType.BYTES26]: "bytes26",
  [SchemaType.BYTES27]: "bytes27",
  [SchemaType.BYTES28]: "bytes28",
  [SchemaType.BYTES29]: "bytes29",
  [SchemaType.BYTES30]: "bytes30",
  [SchemaType.BYTES31]: "bytes31",
  [SchemaType.BYTES32]: "bytes32",

  [SchemaType.BOOL]: "bool",
  [SchemaType.ADDRESS]: "address",

  [SchemaType.UINT8_ARRAY]: "uint8[]",
  [SchemaType.UINT16_ARRAY]: "uint16[]",
  [SchemaType.UINT24_ARRAY]: "uint24[]",
  [SchemaType.UINT32_ARRAY]: "uint32[]",
  [SchemaType.UINT40_ARRAY]: "uint40[]",
  [SchemaType.UINT48_ARRAY]: "uint48[]",
  [SchemaType.UINT56_ARRAY]: "uint56[]",
  [SchemaType.UINT64_ARRAY]: "uint64[]",
  [SchemaType.UINT72_ARRAY]: "uint72[]",
  [SchemaType.UINT80_ARRAY]: "uint80[]",
  [SchemaType.UINT88_ARRAY]: "uint88[]",
  [SchemaType.UINT96_ARRAY]: "uint96[]",
  [SchemaType.UINT104_ARRAY]: "uint104[]",
  [SchemaType.UINT112_ARRAY]: "uint112[]",
  [SchemaType.UINT120_ARRAY]: "uint120[]",
  [SchemaType.UINT128_ARRAY]: "uint128[]",
  [SchemaType.UINT136_ARRAY]: "uint136[]",
  [SchemaType.UINT144_ARRAY]: "uint144[]",
  [SchemaType.UINT152_ARRAY]: "uint152[]",
  [SchemaType.UINT160_ARRAY]: "uint160[]",
  [SchemaType.UINT168_ARRAY]: "uint168[]",
  [SchemaType.UINT176_ARRAY]: "uint176[]",
  [SchemaType.UINT184_ARRAY]: "uint184[]",
  [SchemaType.UINT192_ARRAY]: "uint192[]",
  [SchemaType.UINT200_ARRAY]: "uint200[]",
  [SchemaType.UINT208_ARRAY]: "uint208[]",
  [SchemaType.UINT216_ARRAY]: "uint216[]",
  [SchemaType.UINT224_ARRAY]: "uint224[]",
  [SchemaType.UINT232_ARRAY]: "uint232[]",
  [SchemaType.UINT240_ARRAY]: "uint240[]",
  [SchemaType.UINT248_ARRAY]: "uint248[]",
  [SchemaType.UINT256_ARRAY]: "uint256[]",

  [SchemaType.INT8_ARRAY]: "int8[]",
  [SchemaType.INT16_ARRAY]: "int16[]",
  [SchemaType.INT24_ARRAY]: "int24[]",
  [SchemaType.INT32_ARRAY]: "int32[]",
  [SchemaType.INT40_ARRAY]: "int40[]",
  [SchemaType.INT48_ARRAY]: "int48[]",
  [SchemaType.INT56_ARRAY]: "int56[]",
  [SchemaType.INT64_ARRAY]: "int64[]",
  [SchemaType.INT72_ARRAY]: "int72[]",
  [SchemaType.INT80_ARRAY]: "int80[]",
  [SchemaType.INT88_ARRAY]: "int88[]",
  [SchemaType.INT96_ARRAY]: "int96[]",
  [SchemaType.INT104_ARRAY]: "int104[]",
  [SchemaType.INT112_ARRAY]: "int112[]",
  [SchemaType.INT120_ARRAY]: "int120[]",
  [SchemaType.INT128_ARRAY]: "int128[]",
  [SchemaType.INT136_ARRAY]: "int136[]",
  [SchemaType.INT144_ARRAY]: "int144[]",
  [SchemaType.INT152_ARRAY]: "int152[]",
  [SchemaType.INT160_ARRAY]: "int160[]",
  [SchemaType.INT168_ARRAY]: "int168[]",
  [SchemaType.INT176_ARRAY]: "int176[]",
  [SchemaType.INT184_ARRAY]: "int184[]",
  [SchemaType.INT192_ARRAY]: "int192[]",
  [SchemaType.INT200_ARRAY]: "int200[]",
  [SchemaType.INT208_ARRAY]: "int208[]",
  [SchemaType.INT216_ARRAY]: "int216[]",
  [SchemaType.INT224_ARRAY]: "int224[]",
  [SchemaType.INT232_ARRAY]: "int232[]",
  [SchemaType.INT240_ARRAY]: "int240[]",
  [SchemaType.INT248_ARRAY]: "int248[]",
  [SchemaType.INT256_ARRAY]: "int256[]",

  [SchemaType.BYTES1_ARRAY]: "bytes1[]",
  [SchemaType.BYTES2_ARRAY]: "bytes2[]",
  [SchemaType.BYTES3_ARRAY]: "bytes3[]",
  [SchemaType.BYTES4_ARRAY]: "bytes4[]",
  [SchemaType.BYTES5_ARRAY]: "bytes5[]",
  [SchemaType.BYTES6_ARRAY]: "bytes6[]",
  [SchemaType.BYTES7_ARRAY]: "bytes7[]",
  [SchemaType.BYTES8_ARRAY]: "bytes8[]",
  [SchemaType.BYTES9_ARRAY]: "bytes9[]",
  [SchemaType.BYTES10_ARRAY]: "bytes10[]",
  [SchemaType.BYTES11_ARRAY]: "bytes11[]",
  [SchemaType.BYTES12_ARRAY]: "bytes12[]",
  [SchemaType.BYTES13_ARRAY]: "bytes13[]",
  [SchemaType.BYTES14_ARRAY]: "bytes14[]",
  [SchemaType.BYTES15_ARRAY]: "bytes15[]",
  [SchemaType.BYTES16_ARRAY]: "bytes16[]",
  [SchemaType.BYTES17_ARRAY]: "bytes17[]",
  [SchemaType.BYTES18_ARRAY]: "bytes18[]",
  [SchemaType.BYTES19_ARRAY]: "bytes19[]",
  [SchemaType.BYTES20_ARRAY]: "bytes20[]",
  [SchemaType.BYTES21_ARRAY]: "bytes21[]",
  [SchemaType.BYTES22_ARRAY]: "bytes22[]",
  [SchemaType.BYTES23_ARRAY]: "bytes23[]",
  [SchemaType.BYTES24_ARRAY]: "bytes24[]",
  [SchemaType.BYTES25_ARRAY]: "bytes25[]",
  [SchemaType.BYTES26_ARRAY]: "bytes26[]",
  [SchemaType.BYTES27_ARRAY]: "bytes27[]",
  [SchemaType.BYTES28_ARRAY]: "bytes28[]",
  [SchemaType.BYTES29_ARRAY]: "bytes29[]",
  [SchemaType.BYTES30_ARRAY]: "bytes30[]",
  [SchemaType.BYTES31_ARRAY]: "bytes31[]",
  [SchemaType.BYTES32_ARRAY]: "bytes32[]",

  [SchemaType.BOOL_ARRAY]: "bool[]",
  [SchemaType.ADDRESS_ARRAY]: "address[]",

  [SchemaType.BYTES]: "bytes",
  [SchemaType.STRING]: "string",
};

export type ArraySchemaType =
  | SchemaType.UINT8_ARRAY
  | SchemaType.UINT16_ARRAY
  | SchemaType.UINT24_ARRAY
  | SchemaType.UINT32_ARRAY
  | SchemaType.UINT40_ARRAY
  | SchemaType.UINT48_ARRAY
  | SchemaType.UINT56_ARRAY
  | SchemaType.UINT64_ARRAY
  | SchemaType.UINT72_ARRAY
  | SchemaType.UINT80_ARRAY
  | SchemaType.UINT88_ARRAY
  | SchemaType.UINT96_ARRAY
  | SchemaType.UINT104_ARRAY
  | SchemaType.UINT112_ARRAY
  | SchemaType.UINT120_ARRAY
  | SchemaType.UINT128_ARRAY
  | SchemaType.UINT136_ARRAY
  | SchemaType.UINT144_ARRAY
  | SchemaType.UINT152_ARRAY
  | SchemaType.UINT160_ARRAY
  | SchemaType.UINT168_ARRAY
  | SchemaType.UINT176_ARRAY
  | SchemaType.UINT184_ARRAY
  | SchemaType.UINT192_ARRAY
  | SchemaType.UINT200_ARRAY
  | SchemaType.UINT208_ARRAY
  | SchemaType.UINT216_ARRAY
  | SchemaType.UINT224_ARRAY
  | SchemaType.UINT232_ARRAY
  | SchemaType.UINT240_ARRAY
  | SchemaType.UINT248_ARRAY
  | SchemaType.UINT256_ARRAY
  | SchemaType.INT8_ARRAY
  | SchemaType.INT16_ARRAY
  | SchemaType.INT24_ARRAY
  | SchemaType.INT32_ARRAY
  | SchemaType.INT40_ARRAY
  | SchemaType.INT48_ARRAY
  | SchemaType.INT56_ARRAY
  | SchemaType.INT64_ARRAY
  | SchemaType.INT72_ARRAY
  | SchemaType.INT80_ARRAY
  | SchemaType.INT88_ARRAY
  | SchemaType.INT96_ARRAY
  | SchemaType.INT104_ARRAY
  | SchemaType.INT112_ARRAY
  | SchemaType.INT120_ARRAY
  | SchemaType.INT128_ARRAY
  | SchemaType.INT136_ARRAY
  | SchemaType.INT144_ARRAY
  | SchemaType.INT152_ARRAY
  | SchemaType.INT160_ARRAY
  | SchemaType.INT168_ARRAY
  | SchemaType.INT176_ARRAY
  | SchemaType.INT184_ARRAY
  | SchemaType.INT192_ARRAY
  | SchemaType.INT200_ARRAY
  | SchemaType.INT208_ARRAY
  | SchemaType.INT216_ARRAY
  | SchemaType.INT224_ARRAY
  | SchemaType.INT232_ARRAY
  | SchemaType.INT240_ARRAY
  | SchemaType.INT248_ARRAY
  | SchemaType.INT256_ARRAY
  | SchemaType.BYTES1_ARRAY
  | SchemaType.BYTES2_ARRAY
  | SchemaType.BYTES3_ARRAY
  | SchemaType.BYTES4_ARRAY
  | SchemaType.BYTES5_ARRAY
  | SchemaType.BYTES6_ARRAY
  | SchemaType.BYTES7_ARRAY
  | SchemaType.BYTES8_ARRAY
  | SchemaType.BYTES9_ARRAY
  | SchemaType.BYTES10_ARRAY
  | SchemaType.BYTES11_ARRAY
  | SchemaType.BYTES12_ARRAY
  | SchemaType.BYTES13_ARRAY
  | SchemaType.BYTES14_ARRAY
  | SchemaType.BYTES15_ARRAY
  | SchemaType.BYTES16_ARRAY
  | SchemaType.BYTES17_ARRAY
  | SchemaType.BYTES18_ARRAY
  | SchemaType.BYTES19_ARRAY
  | SchemaType.BYTES20_ARRAY
  | SchemaType.BYTES21_ARRAY
  | SchemaType.BYTES22_ARRAY
  | SchemaType.BYTES23_ARRAY
  | SchemaType.BYTES24_ARRAY
  | SchemaType.BYTES25_ARRAY
  | SchemaType.BYTES26_ARRAY
  | SchemaType.BYTES27_ARRAY
  | SchemaType.BYTES28_ARRAY
  | SchemaType.BYTES29_ARRAY
  | SchemaType.BYTES30_ARRAY
  | SchemaType.BYTES31_ARRAY
  | SchemaType.BYTES32_ARRAY
  | SchemaType.BOOL_ARRAY
  | SchemaType.ADDRESS_ARRAY;

export const SchemaTypeArrayToElement = {
  [SchemaType.UINT8_ARRAY]: SchemaType.UINT8,
  [SchemaType.UINT16_ARRAY]: SchemaType.UINT16,
  [SchemaType.UINT24_ARRAY]: SchemaType.UINT24,
  [SchemaType.UINT32_ARRAY]: SchemaType.UINT32,
  [SchemaType.UINT40_ARRAY]: SchemaType.UINT40,
  [SchemaType.UINT48_ARRAY]: SchemaType.UINT48,
  [SchemaType.UINT56_ARRAY]: SchemaType.UINT56,
  [SchemaType.UINT64_ARRAY]: SchemaType.UINT64,
  [SchemaType.UINT72_ARRAY]: SchemaType.UINT72,
  [SchemaType.UINT80_ARRAY]: SchemaType.UINT80,
  [SchemaType.UINT88_ARRAY]: SchemaType.UINT88,
  [SchemaType.UINT96_ARRAY]: SchemaType.UINT96,
  [SchemaType.UINT104_ARRAY]: SchemaType.UINT104,
  [SchemaType.UINT112_ARRAY]: SchemaType.UINT112,
  [SchemaType.UINT120_ARRAY]: SchemaType.UINT120,
  [SchemaType.UINT128_ARRAY]: SchemaType.UINT128,
  [SchemaType.UINT136_ARRAY]: SchemaType.UINT136,
  [SchemaType.UINT144_ARRAY]: SchemaType.UINT144,
  [SchemaType.UINT152_ARRAY]: SchemaType.UINT152,
  [SchemaType.UINT160_ARRAY]: SchemaType.UINT160,
  [SchemaType.UINT168_ARRAY]: SchemaType.UINT168,
  [SchemaType.UINT176_ARRAY]: SchemaType.UINT176,
  [SchemaType.UINT184_ARRAY]: SchemaType.UINT184,
  [SchemaType.UINT192_ARRAY]: SchemaType.UINT192,
  [SchemaType.UINT200_ARRAY]: SchemaType.UINT200,
  [SchemaType.UINT208_ARRAY]: SchemaType.UINT208,
  [SchemaType.UINT216_ARRAY]: SchemaType.UINT216,
  [SchemaType.UINT224_ARRAY]: SchemaType.UINT224,
  [SchemaType.UINT232_ARRAY]: SchemaType.UINT232,
  [SchemaType.UINT240_ARRAY]: SchemaType.UINT240,
  [SchemaType.UINT248_ARRAY]: SchemaType.UINT248,
  [SchemaType.UINT256_ARRAY]: SchemaType.UINT256,

  [SchemaType.INT8_ARRAY]: SchemaType.INT8,
  [SchemaType.INT16_ARRAY]: SchemaType.INT16,
  [SchemaType.INT24_ARRAY]: SchemaType.INT24,
  [SchemaType.INT32_ARRAY]: SchemaType.INT32,
  [SchemaType.INT40_ARRAY]: SchemaType.INT40,
  [SchemaType.INT48_ARRAY]: SchemaType.INT48,
  [SchemaType.INT56_ARRAY]: SchemaType.INT56,
  [SchemaType.INT64_ARRAY]: SchemaType.INT64,
  [SchemaType.INT72_ARRAY]: SchemaType.INT72,
  [SchemaType.INT80_ARRAY]: SchemaType.INT80,
  [SchemaType.INT88_ARRAY]: SchemaType.INT88,
  [SchemaType.INT96_ARRAY]: SchemaType.INT96,
  [SchemaType.INT104_ARRAY]: SchemaType.INT104,
  [SchemaType.INT112_ARRAY]: SchemaType.INT112,
  [SchemaType.INT120_ARRAY]: SchemaType.INT120,
  [SchemaType.INT128_ARRAY]: SchemaType.INT128,
  [SchemaType.INT136_ARRAY]: SchemaType.INT136,
  [SchemaType.INT144_ARRAY]: SchemaType.INT144,
  [SchemaType.INT152_ARRAY]: SchemaType.INT152,
  [SchemaType.INT160_ARRAY]: SchemaType.INT160,
  [SchemaType.INT168_ARRAY]: SchemaType.INT168,
  [SchemaType.INT176_ARRAY]: SchemaType.INT176,
  [SchemaType.INT184_ARRAY]: SchemaType.INT184,
  [SchemaType.INT192_ARRAY]: SchemaType.INT192,
  [SchemaType.INT200_ARRAY]: SchemaType.INT200,
  [SchemaType.INT208_ARRAY]: SchemaType.INT208,
  [SchemaType.INT216_ARRAY]: SchemaType.INT216,
  [SchemaType.INT224_ARRAY]: SchemaType.INT224,
  [SchemaType.INT232_ARRAY]: SchemaType.INT232,
  [SchemaType.INT240_ARRAY]: SchemaType.INT240,
  [SchemaType.INT248_ARRAY]: SchemaType.INT248,
  [SchemaType.INT256_ARRAY]: SchemaType.INT256,

  [SchemaType.BYTES1_ARRAY]: SchemaType.BYTES1,
  [SchemaType.BYTES2_ARRAY]: SchemaType.BYTES2,
  [SchemaType.BYTES3_ARRAY]: SchemaType.BYTES3,
  [SchemaType.BYTES4_ARRAY]: SchemaType.BYTES4,
  [SchemaType.BYTES5_ARRAY]: SchemaType.BYTES5,
  [SchemaType.BYTES6_ARRAY]: SchemaType.BYTES6,
  [SchemaType.BYTES7_ARRAY]: SchemaType.BYTES7,
  [SchemaType.BYTES8_ARRAY]: SchemaType.BYTES8,
  [SchemaType.BYTES9_ARRAY]: SchemaType.BYTES9,
  [SchemaType.BYTES10_ARRAY]: SchemaType.BYTES10,
  [SchemaType.BYTES11_ARRAY]: SchemaType.BYTES11,
  [SchemaType.BYTES12_ARRAY]: SchemaType.BYTES12,
  [SchemaType.BYTES13_ARRAY]: SchemaType.BYTES13,
  [SchemaType.BYTES14_ARRAY]: SchemaType.BYTES14,
  [SchemaType.BYTES15_ARRAY]: SchemaType.BYTES15,
  [SchemaType.BYTES16_ARRAY]: SchemaType.BYTES16,
  [SchemaType.BYTES17_ARRAY]: SchemaType.BYTES17,
  [SchemaType.BYTES18_ARRAY]: SchemaType.BYTES18,
  [SchemaType.BYTES19_ARRAY]: SchemaType.BYTES19,
  [SchemaType.BYTES20_ARRAY]: SchemaType.BYTES20,
  [SchemaType.BYTES21_ARRAY]: SchemaType.BYTES21,
  [SchemaType.BYTES22_ARRAY]: SchemaType.BYTES22,
  [SchemaType.BYTES23_ARRAY]: SchemaType.BYTES23,
  [SchemaType.BYTES24_ARRAY]: SchemaType.BYTES24,
  [SchemaType.BYTES25_ARRAY]: SchemaType.BYTES25,
  [SchemaType.BYTES26_ARRAY]: SchemaType.BYTES26,
  [SchemaType.BYTES27_ARRAY]: SchemaType.BYTES27,
  [SchemaType.BYTES28_ARRAY]: SchemaType.BYTES28,
  [SchemaType.BYTES29_ARRAY]: SchemaType.BYTES29,
  [SchemaType.BYTES30_ARRAY]: SchemaType.BYTES30,
  [SchemaType.BYTES31_ARRAY]: SchemaType.BYTES31,
  [SchemaType.BYTES32_ARRAY]: SchemaType.BYTES32,

  [SchemaType.BOOL_ARRAY]: SchemaType.BOOL,
  [SchemaType.ADDRESS_ARRAY]: SchemaType.ADDRESS,
} as {
  [K in SchemaType]: K extends ArraySchemaType ? SchemaType : undefined;
};
