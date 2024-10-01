import { Client, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
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
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { flattenStoreLogs, getStoreLogs } from "@latticexyz/store/internal";

// TODO: add label and namespaceLabel once we register it onchain
type DeployedTable = Omit<Table, "label" | "namespaceLabel">;

export async function getTables({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Omit<DeployedTable, "label">[]> {
  debug("looking up tables for", worldDeploy.address);

  const blockLogs = await fetchBlockLogs({
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldDeploy.address,
        fromBlock,
        toBlock,
        tableId: storeConfig.namespaces.store.tables.Tables.tableId,
      });
    },
  });
  const logs = flattenStoreLogs(blockLogs.flatMap((block) => block.logs));

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
