import { Hex, concatHex, padHex, size } from "viem";
import { encodeField } from "./encodeField";

export function encodeLengths(values: Hex[]): Hex {
  const byteLengths = values.map(size).reverse();
  const totalByteLength = byteLengths.reduce((total, length) => total + BigInt(length), 0n);

  return padHex(
    concatHex([...byteLengths.map((length) => encodeField("uint40", length)), encodeField("uint56", totalByteLength)]),
    { size: 32, dir: "left" }
  );
}
