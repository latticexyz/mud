import { Client, Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToSchema } from "@latticexyz/protocol-parser/internal";
import { Schema, Table } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";
import { getRecords } from "@latticexyz/store-sync";

// TODO: add label and namespaceLabel once we register it onchain
type DeployedTable = Omit<Table, "label" | "namespaceLabel"> & {
  readonly keySchema: Schema;
  readonly keySchemaHex: Hex;
  readonly valueSchema: Schema;
  readonly valueSchemaHex: Hex;
};

export async function getTables({
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Omit<DeployedTable, "label">[]> {
  debug("looking up tables for", worldDeploy.address);

  const { records } = await getRecords({
    table: storeConfig.namespaces.store.tables.Tables,
    worldAddress: worldDeploy.address,
    indexerUrl: "https://indexer.mud.garnetchain.com",
    chainId: 17069,
  });

  // TODO: combine with store-sync logToTable and export from somewhere
  const tables = records.map((record) => {
    const { type, namespace, name } = hexToResource(record.tableId);

    const solidityKeySchema = hexToSchema(record.keySchema);
    const solidityValueSchema = hexToSchema(record.valueSchema);
    const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), record.abiEncodedKeyNames)[0];
    const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), record.abiEncodedFieldNames)[0];

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
      tableId: record.tableId,
      schema: { ...keySchema, ...valueSchema },
      key: Object.keys(keySchema),
      keySchema,
      keySchemaHex: record.keySchema,
      valueSchema,
      valueSchemaHex: record.valueSchema,
    };
  });

  // TODO: filter/detect duplicates?

  debug("found", tables.length, "tables for", worldDeploy.address);

  return tables;
}
