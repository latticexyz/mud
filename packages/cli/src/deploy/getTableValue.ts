import {
  KeySchema,
  decodeValueArgs,
  encodeKey,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { WorldDeploy, worldAbi } from "./common";
import { Client } from "viem";
import { readContract } from "viem/actions";
import { Table } from "@latticexyz/store/config/v2";
import { schemaToPrimitives } from "./schemaToPrimitives";

export async function getTableValue<table extends Table>({
  client,
  worldDeploy,
  table,
  key,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
  readonly table: table;
  readonly key: schemaToPrimitives<getKeySchema<table>>;
}): Promise<schemaToPrimitives<getValueSchema<table>>> {
  const keySchema = getSchemaTypes(getKeySchema(table));
  const [staticData, encodedLengths, dynamicData] = await readContract(client, {
    blockNumber: worldDeploy.stateBlock,
    address: worldDeploy.address,
    abi: worldAbi,
    functionName: "getRecord",
    args: [table.tableId, encodeKey(keySchema as KeySchema, key)],
  });
  return decodeValueArgs(getSchemaTypes(getValueSchema(table)), {
    staticData,
    encodedLengths,
    dynamicData,
  });
}
