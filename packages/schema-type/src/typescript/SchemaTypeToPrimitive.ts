import { SchemaType } from "./SchemaType";

// TODO: migrate to viem's type mapping based on solidity mapping above

type BooleanTypes = SchemaType.BOOL;
type NumberTypes =
  | SchemaType.UINT8
  | SchemaType.UINT16
  | SchemaType.UINT24
  | SchemaType.UINT32
  | SchemaType.UINT40
  | SchemaType.UINT48
  | SchemaType.INT8
  | SchemaType.INT16
  | SchemaType.INT24
  | SchemaType.INT32
  | SchemaType.INT40
  | SchemaType.INT48;

type BigIntTypes =
  | SchemaType.UINT56
  | SchemaType.UINT64
  | SchemaType.UINT72
  | SchemaType.UINT80
  | SchemaType.UINT88
  | SchemaType.UINT96
  | SchemaType.UINT104
  | SchemaType.UINT112
  | SchemaType.UINT120
  | SchemaType.UINT128
  | SchemaType.UINT136
  | SchemaType.UINT144
  | SchemaType.UINT152
  | SchemaType.UINT160
  | SchemaType.UINT168
  | SchemaType.UINT176
  | SchemaType.UINT184
  | SchemaType.UINT192
  | SchemaType.UINT200
  | SchemaType.UINT208
  | SchemaType.UINT216
  | SchemaType.UINT224
  | SchemaType.UINT232
  | SchemaType.UINT240
  | SchemaType.UINT248
  | SchemaType.UINT256
  | SchemaType.INT56
  | SchemaType.INT64
  | SchemaType.INT72
  | SchemaType.INT80
  | SchemaType.INT88
  | SchemaType.INT96
  | SchemaType.INT104
  | SchemaType.INT112
  | SchemaType.INT120
  | SchemaType.INT128
  | SchemaType.INT136
  | SchemaType.INT144
  | SchemaType.INT152
  | SchemaType.INT160
  | SchemaType.INT168
  | SchemaType.INT176
  | SchemaType.INT184
  | SchemaType.INT192
  | SchemaType.INT200
  | SchemaType.INT208
  | SchemaType.INT216
  | SchemaType.INT224
  | SchemaType.INT232
  | SchemaType.INT240
  | SchemaType.INT248
  | SchemaType.INT256;

type StringTypes =
  | SchemaType.STRING
  | SchemaType.ADDRESS
  | SchemaType.BYTES
  | SchemaType.BYTES1
  | SchemaType.BYTES2
  | SchemaType.BYTES3
  | SchemaType.BYTES4
  | SchemaType.BYTES5
  | SchemaType.BYTES6
  | SchemaType.BYTES7
  | SchemaType.BYTES8
  | SchemaType.BYTES9
  | SchemaType.BYTES10
  | SchemaType.BYTES11
  | SchemaType.BYTES12
  | SchemaType.BYTES13
  | SchemaType.BYTES14
  | SchemaType.BYTES15
  | SchemaType.BYTES16
  | SchemaType.BYTES17
  | SchemaType.BYTES18
  | SchemaType.BYTES19
  | SchemaType.BYTES20
  | SchemaType.BYTES21
  | SchemaType.BYTES22
  | SchemaType.BYTES23
  | SchemaType.BYTES24
  | SchemaType.BYTES25
  | SchemaType.BYTES26
  | SchemaType.BYTES27
  | SchemaType.BYTES28
  | SchemaType.BYTES29
  | SchemaType.BYTES30
  | SchemaType.BYTES31
  | SchemaType.BYTES32;

type BooleanArrayTypes = SchemaType.BOOL_ARRAY;

type NumberArrayTypes =
  | SchemaType.UINT8_ARRAY
  | SchemaType.UINT16_ARRAY
  | SchemaType.UINT24_ARRAY
  | SchemaType.UINT32_ARRAY
  | SchemaType.UINT40_ARRAY
  | SchemaType.UINT48_ARRAY
  | SchemaType.INT8_ARRAY
  | SchemaType.INT16_ARRAY
  | SchemaType.INT24_ARRAY
  | SchemaType.INT32_ARRAY
  | SchemaType.INT40_ARRAY
  | SchemaType.INT48_ARRAY;

type BigIntArrayTypes =
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
  | SchemaType.INT256_ARRAY;

type StringArrayTypes =
  | SchemaType.ADDRESS_ARRAY
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
  | SchemaType.BYTES32_ARRAY;

export type SchemaTypeToPrimitive<T extends SchemaType> = T extends BooleanTypes
  ? boolean
  : T extends StringTypes
  ? string
  : T extends NumberTypes
  ? number
  : T extends BigIntTypes
  ? bigint
  : T extends BooleanArrayTypes
  ? boolean[]
  : T extends NumberArrayTypes
  ? number[]
  : T extends BigIntArrayTypes
  ? bigint[]
  : T extends StringArrayTypes
  ? string[]
  : never;

// export type SchemaTypeToPrimitive = {
//   [SchemaType.UINT8]: number;
//   [SchemaType.UINT16]: number;
//   [SchemaType.UINT24]: number;
//   [SchemaType.UINT32]: number;
//   [SchemaType.UINT40]: number;
//   [SchemaType.UINT48]: number;
//   [SchemaType.UINT56]: bigint;
//   [SchemaType.UINT64]: bigint;
//   [SchemaType.UINT72]: bigint;
//   [SchemaType.UINT80]: bigint;
//   [SchemaType.UINT88]: bigint;
//   [SchemaType.UINT96]: bigint;
//   [SchemaType.UINT104]: bigint;
//   [SchemaType.UINT112]: bigint;
//   [SchemaType.UINT120]: bigint;
//   [SchemaType.UINT128]: bigint;
//   [SchemaType.UINT136]: bigint;
//   [SchemaType.UINT144]: bigint;
//   [SchemaType.UINT152]: bigint;
//   [SchemaType.UINT160]: bigint;
//   [SchemaType.UINT168]: bigint;
//   [SchemaType.UINT176]: bigint;
//   [SchemaType.UINT184]: bigint;
//   [SchemaType.UINT192]: bigint;
//   [SchemaType.UINT200]: bigint;
//   [SchemaType.UINT208]: bigint;
//   [SchemaType.UINT216]: bigint;
//   [SchemaType.UINT224]: bigint;
//   [SchemaType.UINT232]: bigint;
//   [SchemaType.UINT240]: bigint;
//   [SchemaType.UINT248]: bigint;
//   [SchemaType.UINT256]: bigint;

//   [SchemaType.INT8]: number;
//   [SchemaType.INT16]: number;
//   [SchemaType.INT24]: number;
//   [SchemaType.INT32]: number;
//   [SchemaType.INT40]: number;
//   [SchemaType.INT48]: number;
//   [SchemaType.INT56]: bigint;
//   [SchemaType.INT64]: bigint;
//   [SchemaType.INT72]: bigint;
//   [SchemaType.INT80]: bigint;
//   [SchemaType.INT88]: bigint;
//   [SchemaType.INT96]: bigint;
//   [SchemaType.INT104]: bigint;
//   [SchemaType.INT112]: bigint;
//   [SchemaType.INT120]: bigint;
//   [SchemaType.INT128]: bigint;
//   [SchemaType.INT136]: bigint;
//   [SchemaType.INT144]: bigint;
//   [SchemaType.INT152]: bigint;
//   [SchemaType.INT160]: bigint;
//   [SchemaType.INT168]: bigint;
//   [SchemaType.INT176]: bigint;
//   [SchemaType.INT184]: bigint;
//   [SchemaType.INT192]: bigint;
//   [SchemaType.INT200]: bigint;
//   [SchemaType.INT208]: bigint;
//   [SchemaType.INT216]: bigint;
//   [SchemaType.INT224]: bigint;
//   [SchemaType.INT232]: bigint;
//   [SchemaType.INT240]: bigint;
//   [SchemaType.INT248]: bigint;
//   [SchemaType.INT256]: bigint;

//   [SchemaType.BYTES1]: string;
//   [SchemaType.BYTES2]: string;
//   [SchemaType.BYTES3]: string;
//   [SchemaType.BYTES4]: string;
//   [SchemaType.BYTES5]: string;
//   [SchemaType.BYTES6]: string;
//   [SchemaType.BYTES7]: string;
//   [SchemaType.BYTES8]: string;
//   [SchemaType.BYTES9]: string;
//   [SchemaType.BYTES10]: string;
//   [SchemaType.BYTES11]: string;
//   [SchemaType.BYTES12]: string;
//   [SchemaType.BYTES13]: string;
//   [SchemaType.BYTES14]: string;
//   [SchemaType.BYTES15]: string;
//   [SchemaType.BYTES16]: string;
//   [SchemaType.BYTES17]: string;
//   [SchemaType.BYTES18]: string;
//   [SchemaType.BYTES19]: string;
//   [SchemaType.BYTES20]: string;
//   [SchemaType.BYTES21]: string;
//   [SchemaType.BYTES22]: string;
//   [SchemaType.BYTES23]: string;
//   [SchemaType.BYTES24]: string;
//   [SchemaType.BYTES25]: string;
//   [SchemaType.BYTES26]: string;
//   [SchemaType.BYTES27]: string;
//   [SchemaType.BYTES28]: string;
//   [SchemaType.BYTES29]: string;
//   [SchemaType.BYTES30]: string;
//   [SchemaType.BYTES31]: string;
//   [SchemaType.BYTES32]: string;

//   [SchemaType.BOOL]: boolean;
//   [SchemaType.ADDRESS]: string;

//   [SchemaType.UINT8_ARRAY]: number[];
//   [SchemaType.UINT16_ARRAY]: number[];
//   [SchemaType.UINT24_ARRAY]: number[];
//   [SchemaType.UINT32_ARRAY]: number[];
//   [SchemaType.UINT40_ARRAY]: number[];
//   [SchemaType.UINT48_ARRAY]: number[];
//   [SchemaType.UINT56_ARRAY]: bigint[];
//   [SchemaType.UINT64_ARRAY]: bigint[];
//   [SchemaType.UINT72_ARRAY]: bigint[];
//   [SchemaType.UINT80_ARRAY]: bigint[];
//   [SchemaType.UINT88_ARRAY]: bigint[];
//   [SchemaType.UINT96_ARRAY]: bigint[];
//   [SchemaType.UINT104_ARRAY]: bigint[];
//   [SchemaType.UINT112_ARRAY]: bigint[];
//   [SchemaType.UINT120_ARRAY]: bigint[];
//   [SchemaType.UINT128_ARRAY]: bigint[];
//   [SchemaType.UINT136_ARRAY]: bigint[];
//   [SchemaType.UINT144_ARRAY]: bigint[];
//   [SchemaType.UINT152_ARRAY]: bigint[];
//   [SchemaType.UINT160_ARRAY]: bigint[];
//   [SchemaType.UINT168_ARRAY]: bigint[];
//   [SchemaType.UINT176_ARRAY]: bigint[];
//   [SchemaType.UINT184_ARRAY]: bigint[];
//   [SchemaType.UINT192_ARRAY]: bigint[];
//   [SchemaType.UINT200_ARRAY]: bigint[];
//   [SchemaType.UINT208_ARRAY]: bigint[];
//   [SchemaType.UINT216_ARRAY]: bigint[];
//   [SchemaType.UINT224_ARRAY]: bigint[];
//   [SchemaType.UINT232_ARRAY]: bigint[];
//   [SchemaType.UINT240_ARRAY]: bigint[];
//   [SchemaType.UINT248_ARRAY]: bigint[];
//   [SchemaType.UINT256_ARRAY]: bigint[];

//   [SchemaType.INT8_ARRAY]: number[];
//   [SchemaType.INT16_ARRAY]: number[];
//   [SchemaType.INT24_ARRAY]: number[];
//   [SchemaType.INT32_ARRAY]: number[];
//   [SchemaType.INT40_ARRAY]: number[];
//   [SchemaType.INT48_ARRAY]: number[];
//   [SchemaType.INT56_ARRAY]: bigint[];
//   [SchemaType.INT64_ARRAY]: bigint[];
//   [SchemaType.INT72_ARRAY]: bigint[];
//   [SchemaType.INT80_ARRAY]: bigint[];
//   [SchemaType.INT88_ARRAY]: bigint[];
//   [SchemaType.INT96_ARRAY]: bigint[];
//   [SchemaType.INT104_ARRAY]: bigint[];
//   [SchemaType.INT112_ARRAY]: bigint[];
//   [SchemaType.INT120_ARRAY]: bigint[];
//   [SchemaType.INT128_ARRAY]: bigint[];
//   [SchemaType.INT136_ARRAY]: bigint[];
//   [SchemaType.INT144_ARRAY]: bigint[];
//   [SchemaType.INT152_ARRAY]: bigint[];
//   [SchemaType.INT160_ARRAY]: bigint[];
//   [SchemaType.INT168_ARRAY]: bigint[];
//   [SchemaType.INT176_ARRAY]: bigint[];
//   [SchemaType.INT184_ARRAY]: bigint[];
//   [SchemaType.INT192_ARRAY]: bigint[];
//   [SchemaType.INT200_ARRAY]: bigint[];
//   [SchemaType.INT208_ARRAY]: bigint[];
//   [SchemaType.INT216_ARRAY]: bigint[];
//   [SchemaType.INT224_ARRAY]: bigint[];
//   [SchemaType.INT232_ARRAY]: bigint[];
//   [SchemaType.INT240_ARRAY]: bigint[];
//   [SchemaType.INT248_ARRAY]: bigint[];
//   [SchemaType.INT256_ARRAY]: bigint[];

//   [SchemaType.BYTES1_ARRAY]: string[];
//   [SchemaType.BYTES2_ARRAY]: string[];
//   [SchemaType.BYTES3_ARRAY]: string[];
//   [SchemaType.BYTES4_ARRAY]: string[];
//   [SchemaType.BYTES5_ARRAY]: string[];
//   [SchemaType.BYTES6_ARRAY]: string[];
//   [SchemaType.BYTES7_ARRAY]: string[];
//   [SchemaType.BYTES8_ARRAY]: string[];
//   [SchemaType.BYTES9_ARRAY]: string[];
//   [SchemaType.BYTES10_ARRAY]: string[];
//   [SchemaType.BYTES11_ARRAY]: string[];
//   [SchemaType.BYTES12_ARRAY]: string[];
//   [SchemaType.BYTES13_ARRAY]: string[];
//   [SchemaType.BYTES14_ARRAY]: string[];
//   [SchemaType.BYTES15_ARRAY]: string[];
//   [SchemaType.BYTES16_ARRAY]: string[];
//   [SchemaType.BYTES17_ARRAY]: string[];
//   [SchemaType.BYTES18_ARRAY]: string[];
//   [SchemaType.BYTES19_ARRAY]: string[];
//   [SchemaType.BYTES20_ARRAY]: string[];
//   [SchemaType.BYTES21_ARRAY]: string[];
//   [SchemaType.BYTES22_ARRAY]: string[];
//   [SchemaType.BYTES23_ARRAY]: string[];
//   [SchemaType.BYTES24_ARRAY]: string[];
//   [SchemaType.BYTES25_ARRAY]: string[];
//   [SchemaType.BYTES26_ARRAY]: string[];
//   [SchemaType.BYTES27_ARRAY]: string[];
//   [SchemaType.BYTES28_ARRAY]: string[];
//   [SchemaType.BYTES29_ARRAY]: string[];
//   [SchemaType.BYTES30_ARRAY]: string[];
//   [SchemaType.BYTES31_ARRAY]: string[];
//   [SchemaType.BYTES32_ARRAY]: string[];

//   [SchemaType.BOOL_ARRAY]: boolean[];
//   [SchemaType.ADDRESS_ARRAY]: string[];

//   [SchemaType.BYTES]: string;
//   [SchemaType.STRING]: string;
// };
