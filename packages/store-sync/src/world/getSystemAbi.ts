import { Client, Abi, Address, hexToString, parseAbiItem } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecords } from "../getRecords";

export async function getSystemAbi({
  client,
  worldAddress,
  fromBlock,
  toBlock,
  indexerUrl,
  chainId,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly fromBlock?: bigint;
  readonly toBlock?: bigint;
  readonly indexerUrl?: string;
  readonly chainId?: number;
}): Promise<Abi> {
  const { records } = await getRecords({
    table: metadataConfig.tables.metadata__ResourceTag,
    worldAddress,
    chainId,
    indexerUrl,
    client,
    fromBlock,
    toBlock,
  });

  const abi = records
    .filter(({ tag }) => hexToString(tag).replace(/\0+$/, "") === "abi")
    .flatMap(({ value }) => (value === "0x" ? [] : hexToString(value).split("\n").map(parseAbiItem)));

  return abi;
}
