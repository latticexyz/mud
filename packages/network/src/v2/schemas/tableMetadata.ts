import { TableId } from "@latticexyz/utils";
import { Contract, utils } from "ethers";
import { metadataTableId, schemaTableId, TableMetadata } from "../common";
import { decodeData } from "./decodeData";
import { registerSchema } from "./tableSchemas";
import { IStore } from "@latticexyz/store/types/ethers-contracts/IStore.sol/IStore";

// worldAddress:tableId => metadata
// TODO: add chain ID to namespace?
export const metadataCache: Partial<Record<`${string}:${string}`, Promise<TableMetadata>>> = {};

// the Contract arguments below assume that they're bound to a provider

export function getMetadata(world: Contract, table: TableId): Promise<TableMetadata> | undefined {
  const cacheKey = `${world.address}:${table.toHexString()}` as const;
  return metadataCache[cacheKey];
}

export function registerMetadata(
  world: Contract,
  table: TableId,
  metadata?: TableMetadata
): Promise<TableMetadata | undefined> {
  const cacheKey = `${world.address}:${table.toHexString()}` as const;

  const cachedMetadataPromise = metadataCache[cacheKey];
  if (cachedMetadataPromise) {
    if (metadata) {
      cachedMetadataPromise.then((cachedMetadata) => {
        if (JSON.stringify(cachedMetadata) !== JSON.stringify(metadata)) {
          console.warn("different metadata already registered for this table", {
            table,
            currentMetadata: cachedMetadata,
            newMetadata: metadata,
            world: world.address,
          });
        }
      });
    }
    return cachedMetadataPromise;
  }

  if (metadata) {
    console.log("registering metadata for table", { table: table.toString(), metadata, world: world.address });
    const metadataPromise = Promise.resolve(metadata);
    metadataCache[cacheKey] = metadataPromise;
    return metadataPromise;
  }

  // TODO: populate from ECS cache before fetching from RPC

  // Skip lazily fetching internal tables
  if (table.toHexString() === schemaTableId.toHexString() || table.toHexString() === metadataTableId.toHexString()) {
    return Promise.resolve(undefined);
  }

  console.log("fetching metadata for table", { table: table.toString(), world: world.address });
  const metadataPromise = Promise.all([
    registerSchema(world, metadataTableId),
    // TODO: figure out how to pass in rawSchema, it was giving me "incorrect length" errors before
    //       we still have to do both calls though, and this is a getter, so this should be fine
    (world as IStore)["getRecord(bytes32,bytes32[])"](metadataTableId.toHexString(), [table.toHexString()]),
  ]).then(([{ valueSchema }, metadataRecord]) => {
    if (valueSchema.isEmpty) {
      console.warn("Metadata schema not found", { table: metadataTableId.toString(), world: world.address });
    }
    if (!metadataRecord || metadataRecord === "0x") {
      console.warn("Metadata not found for table", { table: table.toString(), world: world.address });
    }
    const decoded = decodeData(valueSchema, metadataRecord);
    const tableName = decoded[0];
    if (tableName !== table.name) {
      console.warn("Metadata table name does not match table ID", {
        tableName,
        tableId: table.toString(),
        world: world.address,
      });
    }
    const [keyNames] = utils.defaultAbiCoder.decode(["string[]"], decoded[1]);
    const [fieldNames] = utils.defaultAbiCoder.decode(["string[]"], decoded[2]);

    return { tableName, keyNames, fieldNames };
  });
  metadataCache[cacheKey] = metadataPromise;
  return metadataPromise;
}
