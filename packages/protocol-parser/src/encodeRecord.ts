import { StaticPrimitiveType, DynamicPrimitiveType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { encodeField } from "./encodeField";
import { Schema } from "./common";

/** @deprecated use `encodeValue` instead */
export function encodeRecord(
  valueSchema: Schema,
  values: readonly (StaticPrimitiveType | DynamicPrimitiveType)[]
): Hex {
  const staticValues = values.slice(0, valueSchema.staticFields.length) as readonly StaticPrimitiveType[];
  const dynamicValues = values.slice(valueSchema.staticFields.length) as readonly DynamicPrimitiveType[];

  const staticData = staticValues
    .map((value, i) => encodeField(valueSchema.staticFields[i], value).replace(/^0x/, ""))
    .join("");

  if (valueSchema.dynamicFields.length === 0) return `0x${staticData}`;

  const dynamicDataItems = dynamicValues.map((value, i) =>
    encodeField(valueSchema.dynamicFields[i], value).replace(/^0x/, "")
  );

  const dynamicFieldByteLengths = dynamicDataItems.map((value) => value.length / 2).reverse();
  const dynamicTotalByteLength = dynamicFieldByteLengths.reduce((total, length) => total + BigInt(length), 0n);

  const dynamicData = dynamicDataItems.join("");

  const packedCounter = `${dynamicFieldByteLengths
    .map((length) => encodeField("uint40", length).replace(/^0x/, ""))
    .join("")}${encodeField("uint56", dynamicTotalByteLength).replace(/^0x/, "")}`.padStart(64, "0");

  return `0x${staticData}${packedCounter}${dynamicData}`;
}
