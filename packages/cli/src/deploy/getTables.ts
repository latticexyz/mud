import { Client, Hex, decodeAbiParameters, parseAbiParameters } from "viem";
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
type DeployedTable = Omit<Table, "label" | "namespaceLabel"> & {
  readonly keySchema: Schema;
  readonly keySchemaHex: Hex;
  readonly valueSchema: Schema;
  readonly valueSchemaHex: Hex;
};

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
    maxBlockRange: 100_000n,
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
    const recordValue = decodeValueArgs(
      getSchemaTypes(getValueSchema(storeConfig.namespaces.store.tables.Tables)),
      log.args,
    );

    const keySchemaHex = recordValue.keySchema;
    const valueSchemaHex = recordValue.valueSchema;
    const solidityKeySchema = hexToSchema(keySchemaHex);
    const solidityValueSchema = hexToSchema(valueSchemaHex);
    const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), recordValue.abiEncodedKeyNames)[0];
    const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), recordValue.abiEncodedFieldNames)[0];

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
      keySchema,
      keySchemaHex,
      valueSchema,
      valueSchemaHex,
    };
  });

  // TODO: filter/detect duplicates?

  debug("found", tables.length, "tables for", worldDeploy.address);

  return tables;
}
