import { Contract } from "ethers";
import { TableId } from "@latticexyz/utils";
import { TableSchema } from "../common";
import { decodeSchema } from "./decodeSchema";
import { IStore } from "@latticexyz/store/types/ethers-contracts/IStore.sol/IStore";

// worldAddress:tableId => schema
// TODO: add chain ID to namespace?
const schemaCache: Partial<Record<`${string}:${string}`, Promise<TableSchema>>> = {};

// the Contract arguments below assume that they're bound to a provider

export function getSchema(world: IStore, table: TableId): Promise<TableSchema> | undefined {
  const cacheKey = `${world.address}:${table.toHexString()}` as const;
  return schemaCache[cacheKey];
}

export function registerSchema(world: Contract, table: TableId, rawSchema?: string): Promise<TableSchema> {
  const cacheKey = `${world.address}:${table.toHexString()}` as const;

  const existingSchema = schemaCache[cacheKey];
  if (existingSchema) {
    // Warn if a different schema was already registered
    if (rawSchema) {
      existingSchema.then((schema) => {
        if (schema.valueSchema.rawSchema !== rawSchema) {
          console.warn("a different schema was already registered for this table", {
            table,
            currentSchema: schema,
            newSchema: rawSchema,
            world: world.address,
          });
        }
      });
    }
    return existingSchema;
  }

  if (rawSchema) {
    console.log("registering schema for table", { table: table.toString(), world: world.address, rawSchema });
    const schema = Promise.resolve(decodeSchema(rawSchema));
    schemaCache[cacheKey] = schema;
    return schema;
  }

  // TODO: populate from ECS cache before fetching from RPC

  console.log("fetching schema for table", { table: table.toString(), world: world.address });
  const store = world as IStore;
  const rawKeySchemaPromise = store.getKeySchema(table.toHexString());
  const rawValueSchemaPromise = store.getSchema(table.toHexString());
  const rawSchemaPromise = Promise.all([rawKeySchemaPromise, rawValueSchemaPromise]).then(
    ([rawKeySchema, rawValueSchema]) => rawValueSchema + rawKeySchema.substring(2)
  );
  const schema = rawSchemaPromise.then((rawSchema: string) => {
    const decodedSchema = decodeSchema(rawSchema);
    if (decodedSchema.valueSchema.isEmpty) {
      console.warn("Schema not found for table", { table: table.toString(), world: world.address });
    }
    return decodedSchema;
  });
  schemaCache[cacheKey] = schema;
  return schema;
}
