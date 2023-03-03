import { getStaticByteLength, SchemaType } from "@latticexyz/schema-type";
import { MUDError } from "./errors.js";

/**
 * Encode a table schema into a bytes32 hex string
 * Port of `Schema.sol` from `@latticexyz/store`
 * @param schema The schema to encode SchemaType[]
 * @returns The encoded schema as a 32 byte hex string
 */
export function encodeSchema(schema: SchemaType[]): string {
  if (schema.length > 28) throw new MUDError("Schema can only have up to 28 fields");
  let encodedSchema = "";
  let length = 0;
  let staticFields = 0;

  // Compute the length of the schema and the number of static fields
  // and store the schema types in the encoded schema
  let hasDynamicFields = false;
  for (let i = 0; i < schema.length; i++) {
    const staticByteLength = getStaticByteLength(schema[i]);

    // Increase the static field count if the field is static
    if (staticByteLength > 0) {
      // Revert if we have seen a dynamic field before, but now we see a static field
      if (hasDynamicFields) throw new MUDError("Static fields must come before dynamic fields in the schema");
      staticFields++;
    } else {
      // Flag that we have seen a dynamic field
      hasDynamicFields = true;
    }

    length += staticByteLength;
    encodedSchema += schema[i].toString(16).padStart(2, "0");
  }

  // Require max 14 dynamic fields
  const dynamicFields = schema.length - staticFields;
  if (dynamicFields > 14) throw new MUDError("Schema can only have up to 14 dynamic fields");

  // Store total static length, and number of static and dynamic fields
  const lengthBytes = length.toString(16).padStart(4, "0"); // 2 length bytes
  const staticFieldsByte = staticFields.toString(16).padStart(2, "0"); // number of static fields
  const dynamicFieldsByte = dynamicFields.toString(16).padStart(2, "0"); // number of dynamic fields
  encodedSchema = lengthBytes + staticFieldsByte + dynamicFieldsByte + encodedSchema;

  return "0x" + encodedSchema.padEnd(64, "0");
}
