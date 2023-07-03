import { StaticPrimitiveType, DynamicPrimitiveType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { encodeField } from "./encodeField";
import { Schema } from "./common";

export function encodeRecord(schema: Schema, values: readonly (StaticPrimitiveType | DynamicPrimitiveType)[]): Hex {
  const staticValues = values.slice(0, schema.staticFields.length) as readonly StaticPrimitiveType[];
  const dynamicValues = values.slice(schema.staticFields.length) as readonly DynamicPrimitiveType[];

  const staticData = staticValues
    .map((value, i) => encodeField(schema.staticFields[i], value).replace(/^0x/, ""))
    .join("");

  if (schema.dynamicFields.length === 0) return `0x${staticData}`;

  const dynamicDataItems = dynamicValues.map((value, i) =>
    encodeField(schema.dynamicFields[i], value).replace(/^0x/, "")
  );

  const dynamicFieldByteLengths = dynamicDataItems.map((value) => value.length / 2);
  const dynamicTotalByteLength = dynamicFieldByteLengths.reduce((total, length) => total + BigInt(length), 0n);

  const dynamicData = dynamicDataItems.join("");

  const packedCounter = `${encodeField("uint56", dynamicTotalByteLength).replace(/^0x/, "")}${dynamicFieldByteLengths
    .map((length) => encodeField("uint40", length).replace(/^0x/, ""))
    .join("")}`.padEnd(64, "0");

  return `0x${staticData}${packedCounter}${dynamicData}`;
}
