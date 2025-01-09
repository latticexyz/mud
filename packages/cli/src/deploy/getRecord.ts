import {
  decodeValueArgs,
  getKeySchema,
  getKeyTuple,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { WorldDeploy, worldAbi } from "./common";
import { Client, Hex } from "viem";
import { readContract } from "viem/actions";
import { Table } from "@latticexyz/config";
import { mapObject } from "@latticexyz/common/utils";
import { show } from "@ark/util";

export async function getRecord<table extends Table>({
  client,
  worldDeploy,
  table,
  key,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
  readonly table: table;
  readonly key: getSchemaPrimitives<getKeySchema<table>>;
}): Promise<show<getSchemaPrimitives<table["schema"]>>> {
  const [staticData, encodedLengths, dynamicData] = (await readContract(client, {
    blockNumber: worldDeploy.stateBlock,
    address: worldDeploy.address,
    abi: worldAbi,
    functionName: "getRecord",
    args: [table.tableId, getKeyTuple(table, key)],
    // TODO: remove cast once https://github.com/wevm/viem/issues/2125 is resolved
    //       has something to do function overloads and TS having a hard time inferring which args to use
  })) as [Hex, Hex, Hex];
  const record = {
    ...key,
    ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), {
      staticData,
      encodedLengths,
      dynamicData,
    }),
  };
  // return in schema order
  return mapObject(table.schema, (value, key) => record[key as never]) as never;
}
