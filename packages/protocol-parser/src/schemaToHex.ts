import { schemaAbiTypes } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { Schema } from "./common";
import { staticDataLength } from "./staticDataLength";

/** @deprecated use `keySchemaToHex` or `valueSchemaToHex` instead */
export function schemaToHex(schema: Schema): Hex {
  const staticSchemaTypes = schema.staticFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
  const dynamicSchemaTypes = schema.dynamicFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
  return `0x${[
    staticDataLength(schema.staticFields).toString(16).padStart(4, "0"),
    schema.staticFields.length.toString(16).padStart(2, "0"),
    schema.dynamicFields.length.toString(16).padStart(2, "0"),
    ...staticSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
    ...dynamicSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
  ]
    .join("")
    .padEnd(64, "0")}`;
}
