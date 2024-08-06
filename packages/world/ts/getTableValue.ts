import {
  decodeValueArgs,
  encodeKey,
  getKeySchema,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { worldAbi } from "./common";
import { Client, Hex, Address } from "viem";
import { readContract } from "viem/actions";
import { Table } from "@latticexyz/config";

export async function getTableValue<table extends Table>({
  client,
  worldAddress,
  stateBlock,
  table,
  key,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly stateBlock: bigint;
  readonly table: table;
  readonly key: getSchemaPrimitives<getKeySchema<table>>;
}): Promise<getSchemaPrimitives<getValueSchema<table>>> {
  const [staticData, encodedLengths, dynamicData] = (await readContract(client, {
    blockNumber: stateBlock,
    address: worldAddress,
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
