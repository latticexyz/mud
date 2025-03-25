import { Client, Abi, Address, hexToString, parseAbiItem, Hex } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecords } from "../getRecords";

export async function getSystemAbi({
  client,
  worldAddress,
  systemId,
  fromBlock,
  toBlock,
  indexerUrl,
  chainId,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly systemId: Hex;
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
    .filter(({ resource, tag }) => hexToString(tag).replace(/\0+$/, "") === "abi" && resource === systemId)
    .flatMap(({ value }) => (value === "0x" ? [] : hexToString(value).split("\n").map(parseAbiItem)));

  return abi;
}
