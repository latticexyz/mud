import { ComponentValue } from "@latticexyz/recs";
import { AbiTypeToSchemaType } from "@latticexyz/schema-type";
import { QueryLayerClient } from "@latticexyz/services/protobuf/ts/mode/mode";
import { TableId } from "@latticexyz/utils";
import { NetworkEvents } from "../../types";

import { CacheStore, createCacheStore, storeEvent } from "../../workers";
import { keyTupleToEntityID } from "../keyTupleToEntityID";
import { decodeValue } from "../schemas/decodeValue";

export async function syncTablesFromMode(
  client: QueryLayerClient,
  chainId: number,
  worldAddress: string
): Promise<CacheStore> {
  const cacheStore = createCacheStore();

  const { tables } = await client.findAll({
    tables: [],
    namespace: {
      chainId: chainId.toString(),
      worldAddress: worldAddress,
    },
  });

  // TODO: get this from MODE
  const blockNumber = 1;

  for (const [truncatedTableId, { rows, cols, types }] of Object.entries(tables)) {
    // table names get truncated by MODE, so we need to pad just to make them valid bytes32, but
    // the table names are still not accurate so we may have data loss
    // TODO: fix this in MODE
    const tableId = TableId.fromHexString(truncatedTableId.padEnd(66, "0"));

    const component = tableId.toString();

    // TODO: separate keys and values/fields in MODE, but we'll infer for now
    const keyLength = cols.findIndex((col) => !col.startsWith("key_"));
    const keyNames = cols.slice(0, keyLength);
    const keyTypes = types.slice(0, keyLength).map((abiType) => AbiTypeToSchemaType[abiType]);
    const fieldNames = cols.slice(keyLength);
    const fieldTypes = types.slice(keyLength).map((abiType) => AbiTypeToSchemaType[abiType]);

    for (const row of rows) {
      const keyTuple = row.values.slice(0, keyLength).map((bytes, i) => decodeValue(keyTypes[i], bytes.buffer));
      const values = row.values.slice(keyLength).map((bytes, i) => decodeValue(fieldTypes[i], bytes.buffer));

      const entity = keyTupleToEntityID(keyTuple);
      const value = Object.fromEntries(values.map((value, i) => [fieldNames[i], value])) as ComponentValue;

      console.log("storing event from MODE", {
        component,
        entity,
        value,
        blockNumber,
      });
      storeEvent(cacheStore, { type: NetworkEvents.NetworkComponentUpdate, component, entity, value, blockNumber });
    }
  }

  return cacheStore;
}
