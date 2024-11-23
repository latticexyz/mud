import {
  decodeValueArgs,
  encodeKey,
  getKeySchema,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { WorldDeploy, worldAbi } from "./common";
import { Client, Hex } from "viem";
import { readContract } from "viem/actions";
import { Table } from "@latticexyz/config";
import { getAction } from "viem/utils";

// TODO: replace calls to this with store's getRecord

export async function getTableValue<table extends Table>({
  client,
  worldDeploy,
  table,
  key,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
  readonly table: table;
  readonly key: getSchemaPrimitives<getKeySchema<table>>;
}): Promise<getSchemaPrimitives<getValueSchema<table>>> {
  const [staticData, encodedLengths, dynamicData] = (await getAction(
    client,
    readContract,
    "readContract",
  )({
    blockNumber: worldDeploy.stateBlock,
    address: worldDeploy.address,
    abi: worldAbi,
    functionName: "getRecord",
    args: [table.tableId, encodeKey(getSchemaTypes(getKeySchema(table)) as never, key as never)],
    // TODO: remove cast once https://github.com/wevm/viem/issues/2125 is resolved
  })) as [Hex, Hex, Hex];
  return decodeValueArgs(getSchemaTypes(getValueSchema(table)), {
    staticData,
    encodedLengths,
    dynamicData,
  });
}
