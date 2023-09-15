import { Hex } from "viem";
import { ValueSchema } from "./common";
import { isDynamicAbiType, isStaticAbiType, staticAbiTypeToByteLength } from "@latticexyz/schema-type";

// TODO: add tests once we have corresponding tests for FieldLayout.sol (bytes32 -> FieldLayout and vice versa)
export function valueSchemaToFieldLayoutHex(valueSchema: ValueSchema): Hex {
  const staticFields = Object.values(valueSchema).filter(isStaticAbiType);
  const dynamicFields = Object.values(valueSchema).filter(isDynamicAbiType);

  const staticFieldLengths = staticFields.map((fieldType) => staticAbiTypeToByteLength[fieldType]);
  const staticDataLength = staticFieldLengths.reduce((dataLength, fieldLength) => dataLength + fieldLength, 0);

  return `0x${[
    staticDataLength.toString(16).padStart(4, "0"),
    staticFields.length.toString(16).padStart(2, "0"),
    dynamicFields.length.toString(16).padStart(2, "0"),
    ...staticFieldLengths.map((fieldLength) => fieldLength.toString(16).padStart(2, "0")),
  ]
    .join("")
    .padEnd(64, "0")}`;
}
