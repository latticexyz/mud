import { Hex } from "viem";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";
import { InvalidHexLengthForPackedCounterError, PackedCounterLengthMismatchError } from "./errors";
import { readHex } from "@latticexyz/common";

// Keep this logic in sync with PackedCounter.sol

// - Last 7 bytes (uint56) are used for the total byte length of the dynamic data
// - The next 5 byte (uint40) sections are used for the byte length of each field, indexed from right to left

// We use byte lengths rather than item counts so that, on chain, we can slice without having to get the value schema first (and thus the field lengths of each dynamic type)

export function hexToPackedCounter(data: Hex): {
  totalByteLength: bigint;
  fieldByteLengths: readonly number[];
} {
  if (data.length !== 66) {
    throw new InvalidHexLengthForPackedCounterError(data);
  }

  const totalByteLength = decodeStaticField("uint56", readHex(data, 32 - 7, 32));
  // TODO: use value schema to make sure we only parse as many as we need (rather than zeroes at the end)?
  const reversedFieldByteLengths = decodeDynamicField("uint40[]", readHex(data, 0, 32 - 7));
  // Reverse the lengths
  const fieldByteLengths = Object.freeze([...reversedFieldByteLengths].reverse());

  const summedLength = BigInt(fieldByteLengths.reduce((total, length) => total + length, 0));
  if (summedLength !== totalByteLength) {
    throw new PackedCounterLengthMismatchError(data, totalByteLength, summedLength);
  }

  return { totalByteLength, fieldByteLengths };
}
