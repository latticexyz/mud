import { BigNumber } from "ethers";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { ContractSchemaValue } from "./types";

const ContractSchemaValueId: { [key in ContractSchemaValue]: string } = {
  [ContractSchemaValue.BOOL]: "bool",
  [ContractSchemaValue.INT8]: "int8",
  [ContractSchemaValue.INT16]: "int16",
  [ContractSchemaValue.INT32]: "int32",
  [ContractSchemaValue.INT64]: "int64",
  [ContractSchemaValue.INT128]: "int128",
  [ContractSchemaValue.INT256]: "int256",
  [ContractSchemaValue.INT]: "int",
  [ContractSchemaValue.UINT8]: "uint8",
  [ContractSchemaValue.UINT16]: "uint16",
  [ContractSchemaValue.UINT32]: "uint32",
  [ContractSchemaValue.UINT64]: "uint64",
  [ContractSchemaValue.UINT128]: "uint128",
  [ContractSchemaValue.UINT256]: "uint256",
  [ContractSchemaValue.BYTES]: "bytes",
  [ContractSchemaValue.STRING]: "string",
  [ContractSchemaValue.BOOL_ARRAY]: "bool[]",
  [ContractSchemaValue.INT8_ARRAY]: "int8[]",
  [ContractSchemaValue.INT16_ARRAY]: "int16[]",
  [ContractSchemaValue.INT32_ARRAY]: "int32[]",
  [ContractSchemaValue.INT64_ARRAY]: "int64[]",
  [ContractSchemaValue.INT128_ARRAY]: "int128[]",
  [ContractSchemaValue.INT256_ARRAY]: "int256[]",
  [ContractSchemaValue.INT_ARRAY]: "int[]",
  [ContractSchemaValue.UINT8_ARRAY]: "uint8[]",
  [ContractSchemaValue.UINT16_ARRAY]: "uint16[]",
  [ContractSchemaValue.UINT32_ARRAY]: "uint32[]",
  [ContractSchemaValue.UINT64_ARRAY]: "uint64[]",
  [ContractSchemaValue.UINT128_ARRAY]: "uint128[]",
  [ContractSchemaValue.UINT256_ARRAY]: "uint256[]",
  [ContractSchemaValue.BYTES_ARRAY]: "bytes[]",
  [ContractSchemaValue.STRING_ARRAY]: "string[]",
};

const ContractSchemaValueArrayToElement = {
  [ContractSchemaValue.BOOL_ARRAY]: ContractSchemaValue.BOOL,
  [ContractSchemaValue.INT8_ARRAY]: ContractSchemaValue.INT8,
  [ContractSchemaValue.INT16_ARRAY]: ContractSchemaValue.INT16,
  [ContractSchemaValue.INT32_ARRAY]: ContractSchemaValue.INT32,
  [ContractSchemaValue.INT64_ARRAY]: ContractSchemaValue.INT64,
  [ContractSchemaValue.INT128_ARRAY]: ContractSchemaValue.INT128,
  [ContractSchemaValue.INT256_ARRAY]: ContractSchemaValue.INT256,
  [ContractSchemaValue.INT_ARRAY]: ContractSchemaValue.INT,
  [ContractSchemaValue.UINT8_ARRAY]: ContractSchemaValue.UINT8,
  [ContractSchemaValue.UINT16_ARRAY]: ContractSchemaValue.UINT16,
  [ContractSchemaValue.UINT32_ARRAY]: ContractSchemaValue.UINT32,
  [ContractSchemaValue.UINT64_ARRAY]: ContractSchemaValue.UINT64,
  [ContractSchemaValue.UINT128_ARRAY]: ContractSchemaValue.UINT128,
  [ContractSchemaValue.UINT256_ARRAY]: ContractSchemaValue.INT256,
  [ContractSchemaValue.BYTES_ARRAY]: ContractSchemaValue.BYTES,
  [ContractSchemaValue.STRING_ARRAY]: ContractSchemaValue.STRING,
} as { [key in ContractSchemaValue]: ContractSchemaValue };

type ContractSchemaValueTypes = {
  [ContractSchemaValue.BOOL]: boolean;
  [ContractSchemaValue.INT8]: number;
  [ContractSchemaValue.INT16]: number;
  [ContractSchemaValue.INT32]: number;
  [ContractSchemaValue.INT64]: string;
  [ContractSchemaValue.INT128]: string;
  [ContractSchemaValue.INT256]: string;
  [ContractSchemaValue.INT]: string;
  [ContractSchemaValue.UINT8]: number;
  [ContractSchemaValue.UINT16]: number;
  [ContractSchemaValue.UINT32]: number;
  [ContractSchemaValue.UINT64]: string;
  [ContractSchemaValue.UINT128]: string;
  [ContractSchemaValue.UINT256]: string;
  [ContractSchemaValue.BYTES]: string;
  [ContractSchemaValue.STRING]: string;
  [ContractSchemaValue.BOOL_ARRAY]: boolean[];
  [ContractSchemaValue.INT8_ARRAY]: number[];
  [ContractSchemaValue.INT16_ARRAY]: number[];
  [ContractSchemaValue.INT32_ARRAY]: number[];
  [ContractSchemaValue.INT64_ARRAY]: string[];
  [ContractSchemaValue.INT128_ARRAY]: string[];
  [ContractSchemaValue.INT256_ARRAY]: string[];
  [ContractSchemaValue.INT_ARRAY]: string[];
  [ContractSchemaValue.UINT8_ARRAY]: number[];
  [ContractSchemaValue.UINT16_ARRAY]: number[];
  [ContractSchemaValue.UINT32_ARRAY]: number[];
  [ContractSchemaValue.UINT64_ARRAY]: string[];
  [ContractSchemaValue.UINT128_ARRAY]: string[];
  [ContractSchemaValue.UINT256_ARRAY]: string[];
  [ContractSchemaValue.BYTES_ARRAY]: string[];
  [ContractSchemaValue.STRING_ARRAY]: string[];
};

export function flattenValue<V extends ContractSchemaValue>(
  value: BigNumber | BigNumber[] | number | number[] | boolean | boolean[] | string | string[],
  valueType: V
): ContractSchemaValueTypes[V] {
  // If value is array, recursively flatten elements
  if (Array.isArray(value))
    return value.map((v) =>
      flattenValue(v, ContractSchemaValueArrayToElement[valueType])
    ) as unknown as ContractSchemaValueTypes[V]; // Typescript things it is possible we return a nested array, but it is not

  // Value is already flat
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean")
    return value as ContractSchemaValueTypes[V];

  // The value returned by abi.decode is Hexable but not a ethers.BigNumber
  value = BigNumber.from(value);

  // Value is a representable number
  if (
    [
      ContractSchemaValue.INT8,
      ContractSchemaValue.INT16,
      ContractSchemaValue.INT32,
      ContractSchemaValue.UINT8,
      ContractSchemaValue.UINT16,
      ContractSchemaValue.UINT32,
    ].includes(valueType)
  ) {
    return value.toNumber() as ContractSchemaValueTypes[V];
  }

  // Value should be represented as a hex string
  if (
    [
      ContractSchemaValue.INT64,
      ContractSchemaValue.INT128,
      ContractSchemaValue.INT256,
      ContractSchemaValue.UINT64,
      ContractSchemaValue.UINT128,
      ContractSchemaValue.UINT256,
      ContractSchemaValue.BYTES,
    ].includes(valueType)
  ) {
    return value.toHexString() as ContractSchemaValueTypes[V];
  }

  // Value should be represented a plain string
  if ([ContractSchemaValue.STRING].includes(valueType)) {
    return value.toString() as ContractSchemaValueTypes[V];
  }

  throw new Error("Unknown value type");
}

/**
 * Constructs a decoder function from given keys and valueTypes.
 * The consumer is responsible for providing a type D matching the keys and valueTypes.
 * @param keys Keys of the component value schema
 * @param valueTypes Value types if the component value schema
 * @returns Function to decode encoded hex value to component value
 */
export function createDecoder<D extends { [key: string]: unknown }>(
  keys: (keyof D)[],
  valueTypes: ContractSchemaValue[]
): (data: string) => D {
  return (data: string) => {
    // Decode data with the schema values provided by the component
    const decoded = abi.decode(
      valueTypes.map((valueType) => ContractSchemaValueId[valueType]),
      data
    );

    // If the contract component only has a single value and no key,
    // use a single key named "value" on the client by default
    if (keys.length === 0 && valueTypes.length === 1) keys = ["value"];

    // Now keys and valueTypes lengths must match
    if (keys.length !== valueTypes.length) {
      throw new Error("Component schema keys and values length does not match");
    }

    // Construct the client component value
    const result: Partial<{ [key in keyof D]: unknown }> = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = flattenValue(decoded[i], valueTypes[i]);
    }

    return result as D;
  };
}
