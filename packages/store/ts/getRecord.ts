import { Address, Client, Hex } from "viem";
import { Table } from "@latticexyz/config";
import {
  decodeValueArgs,
  getKeySchema,
  getKeyTuple,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";

export type GetRecordOptions<table extends Table> = {
  address: Address;
  table: table;
  key: getSchemaPrimitives<getKeySchema<table>>;
  blockTag?: "latest" | "pending";
};

export async function getRecord<table extends Table>(
  client: Client,
  { address, table, key, blockTag }: GetRecordOptions<table>,
): Promise<getSchemaPrimitives<table["schema"]>> {
  const [staticData, encodedLengths, dynamicData] = await getAction(
    client,
    readContract,
    "readContract",
  )({
    address,
    abi,
    functionName: "getRecord",
    args: [table.tableId, getKeyTuple(table, key) as readonly Hex[]],
    blockTag,
  });

  return {
    ...key,
    ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), { staticData, encodedLengths, dynamicData }),
  };
}

const abi = [
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
] as const;
