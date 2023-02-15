import { SchemaType } from "./SchemaType";
import { hexToArray } from "./hexToArray";
import { Contract } from "ethers";

export type Schema = {
  staticDataLength: number;
  staticFields: SchemaType[];
  dynamicFields: SchemaType[];
  rawSchema: string;
};

// worldAddress:tableId => schema
// TODO: add chain ID to namespace?
const schemas: Partial<Record<`${string}:${string}`, Promise<Schema>>> = {};

export function decodeSchema(rawSchema: string): Schema {
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
  // TODO: validate sum of static field lengths is equal to staticDataLength?
  return { staticDataLength, staticFields, dynamicFields, rawSchema };
}

// the Contract arguments below assume that they're bound to a provider

export function getSchema(world: Contract, table: string): Promise<Schema> | undefined {
  const schemaKey = `${world.address}:${table}` as const;
  return schemas[schemaKey];
}

export function registerSchema(world: Contract, table: string, rawSchema?: string): Promise<Schema> {
  const schemaKey = `${world.address}:${table}` as const;

  const existingSchema = schemas[schemaKey];
  if (existingSchema) {
    // Warn if a different schema was already registered at this key
    if (rawSchema) {
      existingSchema.then((schema) => {
        if (schema.rawSchema !== rawSchema) {
          console.warn("a different schema was already registered for this table", {
            world: world.address,
            table,
            currentSchema: schema,
            newSchema: rawSchema,
          });
        }
      });
    }
    return existingSchema;
  }

  if (rawSchema) {
    console.log("registering schema for table", world.address, table);
    const schema = Promise.resolve(decodeSchema(rawSchema));
    schemas[schemaKey] = schema;
    return schema;
  }

  console.log("fetching schema for table", world.address, table);
  const schema = world.getSchema(table).then((rawSchema: string) => decodeSchema(rawSchema));
  schemas[schemaKey] = schema;
  return schema;
}
