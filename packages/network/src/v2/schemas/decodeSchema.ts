import { getStaticByteLength, SchemaType, SchemaTypeToAbiType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { TableSchema } from "../common";

export function decodeSchema(rawSchema: string): TableSchema {
  console.log("decodeSchema", rawSchema, rawSchema.length);
  const isEmpty = !rawSchema || rawSchema === "0x";
  const buffer = isEmpty ? new Uint8Array(64).buffer : hexToArray(rawSchema).buffer;
  const valueSchemaBytes = new DataView(buffer); // First 32 bytes of the raw schema are the value schema
  const keySchemaBytes = new DataView(buffer.slice(32)); // Last 32 bytes of the raw schema are the key schema

  const valueSchema = { ...decodeSchemaBytes(valueSchemaBytes), rawSchema, isEmpty };
  console.log("value schema", rawSchema, valueSchema);
  const keySchema = { ...decodeSchemaBytes(keySchemaBytes), rawSchema, isEmpty };
  console.log("key schema", keySchema);

  return { valueSchema, keySchema };
}

function decodeSchemaBytes(schemaBytes: DataView) {
  const staticDataLength = schemaBytes.getUint16(0);
  const numStaticFields = schemaBytes.getUint8(2);
  const numDynamicFields = schemaBytes.getUint8(3);
  const staticFields: SchemaType[] = [];
  const dynamicFields: SchemaType[] = [];
  for (let i = 4; i < 4 + numStaticFields; i++) {
    staticFields.push(schemaBytes.getUint8(i));
  }
  for (let i = 4 + numStaticFields; i < 4 + numStaticFields + numDynamicFields; i++) {
    dynamicFields.push(schemaBytes.getUint8(i));
  }

  // validate static data length
  const actualStaticDataLength = staticFields.reduce((acc, fieldType) => acc + getStaticByteLength(fieldType), 0);
  if (actualStaticDataLength !== staticDataLength) {
    console.error("Schema static data length mismatch! Is `getStaticByteLength` outdated?", {
      schemaStaticDataLength: staticDataLength,
      actualStaticDataLength,
      schemaBytes,
    });
    throw new Error("Schema static data length mismatch! Is `getStaticByteLength` outdated?");
  }

  const abiTypes = [...staticFields, ...dynamicFields].map((type) => SchemaTypeToAbiType[type]);
  const abi = `(${abiTypes.join(",")})`;

  return { staticDataLength, staticFields, dynamicFields, abi };
}
