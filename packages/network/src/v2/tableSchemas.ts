import { Contract } from "ethers";
import { TableSchema } from "./constants";
import { decodeSchema } from "./decodeSchema";

// worldAddress:tableId => schema
// TODO: add chain ID to namespace?
const schemas: Partial<Record<`${string}:${string}`, Promise<TableSchema>>> = {};

// the Contract arguments below assume that they're bound to a provider

export function getSchema(world: Contract, table: string): Promise<TableSchema> | undefined {
  const schemaKey = `${world.address}:${table}` as const;
  return schemas[schemaKey];
}

export function registerSchema(world: Contract, table: string, rawSchema?: string): Promise<TableSchema> {
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
    console.log("registering schema for table", { table, world: world.address });
    const schema = Promise.resolve(decodeSchema(rawSchema));
    schemas[schemaKey] = schema;
    return schema;
  }

  console.log("fetching schema for table", { table, world: world.address });
  const schema = world.getSchema(table).then((rawSchema: string) => decodeSchema(rawSchema));
  schemas[schemaKey] = schema;
  return schema;
}
