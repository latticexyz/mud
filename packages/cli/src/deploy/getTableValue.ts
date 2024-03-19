import { decodeValueArgs, encodeKey } from "@latticexyz/protocol-parser/internal";
import { WorldDeploy, worldAbi } from "./common";
import { Client } from "viem";
import { readContract } from "viem/actions";
import { Table } from "@latticexyz/store/config/v2";
import { schemaToPrimitives } from "./schemaToPrimitives";
import { flattenSchema } from "./flattenSchema";

export async function getTableValue<table extends Table>({
  client,
  worldDeploy,
  table,
  key,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
  readonly table: table;
  readonly key: schemaToPrimitives<table["keySchema"]>;
}): Promise<schemaToPrimitives<table["valueSchema"]>> {
  const [staticData, encodedLengths, dynamicData] = await readContract(client, {
    blockNumber: worldDeploy.stateBlock,
    address: worldDeploy.address,
    abi: worldAbi,
    functionName: "getRecord",
    args: [table.tableId, encodeKey(flattenSchema(table.keySchema), key)],
  });
  return decodeValueArgs(flattenSchema(table.valueSchema), {
    staticData,
    encodedLengths,
    dynamicData,
  }) as schemaToPrimitives<table["valueSchema"]>;
}
