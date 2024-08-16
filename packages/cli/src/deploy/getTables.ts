import { Client, parseAbiItem, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { storeSetRecordEvent } from "@latticexyz/store";
import { getLogs } from "viem/actions";
import {
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
  hexToSchema,
} from "@latticexyz/protocol-parser/internal";
import { Schema, Table } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";

// TODO: add label and namespaceLabel once we register it onchain
type DeployedTable = Omit<Table, "label" | "namespaceLabel">;

export async function getTables({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Omit<DeployedTable, "label">[]> {
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
    args: { tableId: storeConfig.namespaces.store.tables.Tables.tableId },
  });

  // TODO: combine with store-sync logToTable and export from somewhere
  const tables = logs.map((log): DeployedTable => {
    const { tableId } = decodeKey(
      getSchemaTypes(getKeySchema(storeConfig.namespaces.store.tables.Tables)),
      log.args.keyTuple,
    );
    const { type, namespace, name } = hexToResource(tableId);
    const value = decodeValueArgs(getSchemaTypes(getValueSchema(storeConfig.namespaces.store.tables.Tables)), log.args);

    const solidityKeySchema = hexToSchema(value.keySchema);
    const solidityValueSchema = hexToSchema(value.valueSchema);
    const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
    const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

    const valueAbiTypes = [...solidityValueSchema.staticFields, ...solidityValueSchema.dynamicFields];

    const keySchema = Object.fromEntries(
      solidityKeySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
    ) satisfies Schema;

    const valueSchema = Object.fromEntries(
      valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
    ) satisfies Schema;

    return {
      type: type as never,
      namespace,
      name,
      tableId,
      schema: { ...keySchema, ...valueSchema },
      key: Object.keys(keySchema),
    };
  });

  // TODO: filter/detect duplicates?

  debug("found", tables.length, "tables for", worldDeploy.address);

  return tables;
}
