import { Address, PublicClient } from "viem";
import { Table } from "@latticexyz/config";
import { decodeValueArgs, getKeySchema, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { readContract } from "viem/actions";
import IStoreReadAbi from "@latticexyz/store/out/IStoreRead.sol/IStoreRead.abi.json";
import { schemaToPrimitives } from "./common";
import { encodeKeyTuple } from "./encodeKeyTuple";

export type GetRecordOptions<table extends Table> = {
  storeAddress: Address;
  table: table;
  key: schemaToPrimitives<getKeySchema<table>>;
  blockTag?: "latest" | "pending";
};

export async function getRecord<table extends Table>(
  publicClient: PublicClient,
  { storeAddress, table, key, blockTag }: GetRecordOptions<table>,
): Promise<schemaToPrimitives<table["schema"]>> {
  const keyTuple = encodeKeyTuple(getKeySchema(table), key);

  const [staticData, encodedLengths, dynamicData] = await readContract(publicClient, {
    address: storeAddress,
    abi: IStoreReadAbi,
    functionName: "getRecord",
    args: [table.tableId, keyTuple],
    blockTag,
  });

  return {
    ...key,
    ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), { staticData, encodedLengths, dynamicData }),
  };
}
