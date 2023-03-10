import { getStaticByteLength, SchemaType, SchemaTypeId } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { TableSchema } from "../common";

export function decodeSchema(rawSchema: string): TableSchema {
  const schemaBytes = new DataView(hexToArray(rawSchema).buffer);
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
      rawSchema,
    });
    throw new Error("Schema static data length mismatch! Is `getStaticByteLength` outdated?");
  }

  const fieldTypes = [...staticFields, ...dynamicFields].map((type) => SchemaTypeId[type]);
  const abi = `(${fieldTypes.join(",")})`;

  return { staticDataLength, staticFields, dynamicFields, rawSchema, abi };
}
