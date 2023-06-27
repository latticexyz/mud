import { Hex, sliceHex } from "viem";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";
import { InvalidHexLengthForPackedCounterError, PackedCounterLengthMismatchError } from "./errors";

// Keep this logic in sync with PackedCounter.sol

// - First 7 bytes (uint56) are used for the total byte length of the dynamic data
// - The next 5 byte (uint40) sections are used for the byte length of each field, in the same order as the schema's dynamic fields

// We use byte lengths rather than item counts so that, on chain, we can slice without having to get the schema first (and thus the field lengths of each dynamic type)

export function hexToPackedCounter(data: Hex): {
  totalByteLength: bigint;
  fieldByteLengths: number[];
} {
  if (data.length !== 66) {
    throw new InvalidHexLengthForPackedCounterError(data);
  }
  const totalByteLength = decodeStaticField("uint56", sliceHex(data, 0, 7));

  // TODO: use schema to make sure we only parse as many as we need (rather than zeroes at the end)?
  const fieldByteLengths = decodeDynamicField("uint40[]", sliceHex(data, 7));

  const summedLength = BigInt(fieldByteLengths.reduce((total, length) => total + length, 0));
  if (summedLength !== totalByteLength) {
    throw new PackedCounterLengthMismatchError(data, totalByteLength, summedLength);
  }

  return { totalByteLength, fieldByteLengths };
}
