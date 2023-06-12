import { BigNumber } from "ethers";
import { BytesLike, defaultAbiCoder as abi } from "ethers/lib/utils.js";
import {
  ContractSchemaValue,
  ContractSchemaValueArrayToElement,
  ContractSchemaValueId,
  ContractSchemaValueTypes,
} from "./types";

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
      ContractSchemaValue.ADDRESS,
      ContractSchemaValue.BYTES4,
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
 * Construct a decoder function from given keys and valueTypes.
 * The consumer is responsible for providing a type D matching the keys and valueTypes.
 *
 * @param keys Keys of the component value schema.
 * @param valueTypes Value types if the component value schema.
 * @returns Function to decode encoded hex value to component value.
 */
export function createDecoder<D extends { [key: string]: unknown }>(
  keys: (keyof D)[],
  valueTypes: ContractSchemaValue[]
): (data: BytesLike) => D {
  return (data: BytesLike) => {
    // Decode data with the schema values provided by the component
    const decoded = abi.decode(
      valueTypes.map((valueType) => ContractSchemaValueId[valueType]),
      data
    );

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
