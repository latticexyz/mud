import { getStaticByteLength } from "./getStaticByteLength.js";
import { SchemaType } from "./SchemaType.js";

/**
 * Encode a table schema into a bytes32 hex string
 * Port of `Schema.sol` from `@latticexyz/store`
 * @param schema The schema to encode SchemaType[]
 * @returns The encoded schema as a 32 byte hex string
 */

export function encodeSchema(schema: SchemaType[]): Uint8Array {
  if (schema.length > 28) throw new Error("Schema can only have up to 28 fields");
  const encodedSchema = new Uint8Array(32);
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
      if (hasDynamicFields) throw new Error("Static fields must come before dynamic fields in the schema");
      staticFields++;
    } else {
      // Flag that we have seen a dynamic field
      hasDynamicFields = true;
    }

    length += staticByteLength;
    encodedSchema[i + 4] = schema[i];
  }

  // Require max 14 dynamic fields
  const dynamicFields = schema.length - staticFields;
  if (dynamicFields > 14) throw new Error("Schema can only have up to 14 dynamic fields");

  // Store total static length, and number of static and dynamic fields
  new DataView(encodedSchema.buffer).setUint16(0, length); // 2 length bytes
  encodedSchema[2] = staticFields; // number of static fields
  encodedSchema[3] = dynamicFields; // number of dynamic fields

  return encodedSchema;
}
