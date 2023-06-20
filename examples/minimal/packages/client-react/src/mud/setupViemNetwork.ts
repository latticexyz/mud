import { PublicClient, Transport, Chain, Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { TableSchema, decodeKeyTuple, hexToTableSchema } from "@latticexyz/protocol-parser";
import {
  BlockEvents,
  createBlockEventsStream,
  createBlockNumberStream,
  createBlockStream,
} from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import { TableId } from "@latticexyz/utils";
import mudConfig from "contracts/mud.config";
import * as devObservables from "@latticexyz/network/dev";

export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

export async function setupViemNetwork<TPublicClient extends PublicClient<Transport, Chain>>(
  publicClient: TPublicClient,
  worldAddress: Hex
) {
  devObservables.publicClient$.next(publicClient);
  devObservables.worldAddress$.next(worldAddress);

  // Optional but recommended to avoid multiple instances of polling for blocks
  const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });
  const latestBlockNumber$ = await createBlockNumberStream({ block$: latestBlock$ });

  const blockEvents$ = await createBlockEventsStream({
    publicClient,
    address: worldAddress,
    events: storeEventsAbi,
    toBlock: latestBlockNumber$,
  });

  // TODO: create a cache per chain/world address
  // TODO: check for world deploy block hash, invalidate cache if it changes
  const db = createDatabase();
  const storeCache = createDatabaseClient(db, mudConfig);

  // TODO: store these in store cache, load into memory
  const tableSchemas: Record<Hex, TableSchema> = {};
  const tableValueNames: Record<Hex, readonly string[]> = {};

  // TODO: emit both schema and metadata within the same event, to avoid this complexity
  // TODO: move this to protocol-parser or a separate "store events stream" lib/package
  function registerSchemas(block: BlockEvents<(typeof storeEventsAbi)[number]>) {
    // parse/store all schemas
    block.events.forEach((event) => {
      if (event.eventName !== "StoreSetRecord") return;

      const { table: tableId, key: keyTuple } = event.args;
      if (tableId !== schemaTableId.toHexString()) return;

      const [tableForSchema, ...otherKeys] = keyTuple;
      if (otherKeys.length) {
        console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", {
          tableId,
          keyTuple,
        });
      }

      const tableSchema = hexToTableSchema(event.args.data);
      tableSchemas[tableForSchema] = tableSchema;
      console.log("registered schema", TableId.fromHexString(tableForSchema).toString(), tableSchema);
    });

    const metadataTableSchema = tableSchemas[metadataTableId.toHexString()];
    if (!metadataTableSchema) {
      throw new Error("metadata table schema was not registered");
    }

    // parse/store all metadata
    block.events.forEach((event) => {
      if (event.eventName !== "StoreSetRecord") return;

      const { table: tableId, key: keyTuple } = event.args;
      if (tableId !== metadataTableId.toHexString()) return;

      const [tableForSchema, ...otherKeys] = keyTuple;
      if (otherKeys.length) {
        console.warn("setMetadata event is expected to have only one key in key tuple, but got multiple", {
          tableId,
          keyTuple,
        });
      }

      const [tableName, abiEncodedFieldNames] = metadataTableSchema.valueSchema.decodeData(event.args.data);
      const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames as Hex)[0];

      tableValueNames[tableForSchema] = fieldNames;
      console.log("registered metadata", TableId.fromHexString(tableForSchema).toString(), fieldNames);
    });
  }

  blockEvents$.subscribe((block) => {
    registerSchemas(block);

    block.events.forEach((event) => {
      const { table: tableIdHex, key: keyTupleHex } = event.args;
      const tableSchema = tableSchemas[tableIdHex];
      if (!tableSchema) {
        console.warn("no table schema found for event", event);
        return;
      }
      const valueNames = tableValueNames[tableIdHex];
      if (!valueNames) {
        console.warn("no table metadata found for event", event);
        return;
      }
      const tableId = TableId.fromHexString(tableIdHex);
      const keyTupleValues = decodeKeyTuple(tableSchema.keySchema, keyTupleHex);
      // TODO: add key names/metadata to registerSchema or setMetadata
      const keyTupleNames = Object.getOwnPropertyNames(
        mudConfig.tables[tableId.name as keyof typeof mudConfig.tables]?.keySchema ?? {}
      );
      const keyTuple = Object.fromEntries(keyTupleValues.map((value, i) => [keyTupleNames[i] ?? i, value]));

      if (event.eventName === "StoreSetRecord" || event.eventName === "StoreEphemeralRecord") {
        const values = tableSchema.valueSchema.decodeData(event.args.data);
        const record = Object.fromEntries(valueNames.map((name, i) => [name, values[i]]));
        storeCache.set(tableId.namespace, tableId.name, keyTuple, record);
        console.log("stored record", tableId.toString(), keyTuple, record);

        devObservables.storeEvent$.next({
          event: event.eventName,
          chainId: publicClient.chain.id,
          worldAddress,
          blockNumber: Number(block.blockNumber),
          logIndex: event.logIndex!,
          transactionHash: event.transactionHash!,
          table: tableId,
          keyTuple: event.args.key,
          indexedValues: Object.fromEntries(values.map((value, i) => [i, value])),
          namedValues: record,
        });
      }

      if (event.eventName === "StoreSetField") {
        const valueName = valueNames[event.args.schemaIndex];
        const value = tableSchema.valueSchema.decodeField(event.args.schemaIndex, event.args.data);
        storeCache.set(tableId.namespace, tableId.name, keyTuple, { [valueName]: value });
        console.log("stored field", tableId.toString(), keyTuple, valueName, "=>", value);

        devObservables.storeEvent$.next({
          event: event.eventName,
          chainId: publicClient.chain.id,
          worldAddress,
          blockNumber: Number(block.blockNumber),
          logIndex: event.logIndex!,
          transactionHash: event.transactionHash!,
          table: tableId,
          keyTuple: event.args.key,
          indexedValues: { [event.args.schemaIndex]: value },
          namedValues: { [valueName]: value },
        });
      }

      if (event.eventName === "StoreDeleteRecord") {
        storeCache.remove(tableId.namespace, tableId.name, keyTuple);
        console.log("removed record", tableId.toString(), keyTuple);

        devObservables.storeEvent$.next({
          event: event.eventName,
          chainId: publicClient.chain.id,
          worldAddress,
          blockNumber: Number(block.blockNumber),
          logIndex: event.logIndex!,
          transactionHash: event.transactionHash!,
          table: tableId,
          keyTuple: event.args.key,
        });
      }
    });
  });

  return {
    publicClient,
    storeCache,
    latestBlock$,
    latestBlockNumber$,
    blockEvents$,
  };
}
