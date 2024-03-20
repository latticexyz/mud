import { Client, parseAbiItem, decodeAbiParameters, parseAbiParameters } from "viem";
import { Table } from "./configToTables";
import { hexToResource } from "@latticexyz/common";
import storeConfig from "@latticexyz/store/mud.config";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { storeSetRecordEvent } from "@latticexyz/store";
import { getLogs } from "viem/actions";
import {
  KeySchema,
  ValueSchema,
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
  hexToSchema,
} from "@latticexyz/protocol-parser/internal";

export async function getTables({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Table[]> {
  // This assumes we only use `Tables._set(...)`, which is true as of this writing.
  // TODO: PR to viem's getLogs to accept topics array so we can filter on all store events and quickly recreate this table's current state
  // TODO: consider moving this to a batched getRecord for Tables table

  debug("looking up tables for", worldDeploy.address);
  const logs = await getLogs(client, {
    strict: true,
    // this may fail for certain RPC providers with block range limits
    // if so, could potentially use our fetchLogs helper (which does pagination)
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    address: worldDeploy.address,
    event: parseAbiItem(storeSetRecordEvent),
    args: { tableId: storeConfig.tables.store__Tables.tableId },
  });

  // TODO: combine with store-sync logToTable and export from somewhere
  const tables = logs.map((log) => {
    const { tableId } = decodeKey(getSchemaTypes(getKeySchema(storeConfig.tables.store__Tables)), log.args.keyTuple);
    const { namespace, name } = hexToResource(tableId);
    const value = decodeValueArgs(getSchemaTypes(getValueSchema(storeConfig.tables.store__Tables)), log.args);

    // TODO: migrate to better helper
    const keySchemaFields = hexToSchema(value.keySchema);
    const valueSchemaFields = hexToSchema(value.valueSchema);
    const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
    const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

    const valueAbiTypes = [...valueSchemaFields.staticFields, ...valueSchemaFields.dynamicFields];

    const keySchema = Object.fromEntries(
      keySchemaFields.staticFields.map((abiType, i) => [keyNames[i], abiType]),
    ) as KeySchema;
    const valueSchema = Object.fromEntries(valueAbiTypes.map((abiType, i) => [fieldNames[i], abiType])) as ValueSchema;

    return { namespace, name, tableId, keySchema, valueSchema } as const;
  });
  // TODO: filter/detect duplicates?

  debug("found", tables.length, "tables for", worldDeploy.address);

  return tables;
}
