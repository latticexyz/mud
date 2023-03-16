import { ComponentValue } from "@latticexyz/recs";
import { AbiTypeToSchemaType, encodeSchema } from "@latticexyz/schema-type";
import { QueryLayerClient } from "@latticexyz/services/protobuf/ts/mode/mode";
import { arrayToHex, TableId } from "@latticexyz/utils";
import { Contract } from "ethers";
import { NetworkEvents } from "../../types";

import { CacheStore, createCacheStore, storeEvent } from "../../workers";
import { keyTupleToEntityID } from "../keyTupleToEntityID";
import { decodeValue } from "../schemas/decodeValue";
import { registerMetadata } from "../schemas/tableMetadata";
import { registerSchema } from "../schemas/tableSchemas";

export async function syncTablesFromMode(
  client: QueryLayerClient,
  chainId: number,
  world: Contract
): Promise<CacheStore> {
  const cacheStore = createCacheStore();

  const response = await client.findAll({
    tables: [],
    namespace: {
      chainId: chainId.toString(),
      worldAddress: world.address,
    },
  });
  console.log("got initial data from MODE", response);

  // TODO: get this from MODE
  const blockNumber = 1;

  const registrationPromises: Promise<any>[] = [];

  for (const [fullTableName, { rows, cols, types }] of Object.entries(response.tables)) {
    const [tableNamespace, tableName] = fullTableName.split("__");
    const tableId = new TableId(tableNamespace, tableName);

    const component = tableId.toString();

    // TODO: separate keys and values/fields in MODE, but we'll infer for now
    const keyLength = cols.findIndex((col) => !col.startsWith("key_"));
    const keyNames = cols.slice(0, keyLength);
    const keyTypes = types.slice(0, keyLength).map((abiType) => AbiTypeToSchemaType[abiType]);
    const fieldNames = cols.slice(keyLength);
    const fieldTypes = types.slice(keyLength).map((abiType) => AbiTypeToSchemaType[abiType]);

    const rawSchema = arrayToHex(encodeSchema(fieldTypes));
    // TODO: refactor registerSchema/registerMetadata to take chain+world address rather than Contract
    registrationPromises.push(registerSchema(world, tableId, rawSchema));
    registrationPromises.push(registerMetadata(world, tableId, { tableName, fieldNames }));

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

  // make sure all schemas/metadata are registered before returning to avoid downstream lookup issues
  await Promise.all(registrationPromises);

  return cacheStore;
}
