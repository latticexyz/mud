import { Hex } from "viem";
import { FieldLayout } from "./common";

/** @deprecated use `valueSchemaToFieldLayoutHex` instead */
export function fieldLayoutToHex(fieldLayout: FieldLayout): Hex {
  const staticDataLength = fieldLayout.staticFieldLengths.reduce((totalLength, length) => totalLength + length, 0);
  return `0x${[
    staticDataLength.toString(16).padStart(4, "0"),
    fieldLayout.staticFieldLengths.length.toString(16).padStart(2, "0"),
    fieldLayout.numDynamicFields.toString(16).padStart(2, "0"),
    ...fieldLayout.staticFieldLengths.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
  ]
    .join("")
    .padEnd(64, "0")}`;
}
