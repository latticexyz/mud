import { Client, Abi, Address, hexToString, parseAbiItem, Hex } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecords } from "../getRecords";

export async function getSystemAbis({
  client,
  worldAddress,
  systemIds,
  fromBlock,
  toBlock,
  indexerUrl,
  chainId,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly systemIds: Hex[];
  readonly fromBlock?: bigint;
  readonly toBlock?: bigint;
  readonly indexerUrl?: string;
  readonly chainId?: number;
}): Promise<{ readonly [systemId: Hex]: Abi }> {
  const { records } = await getRecords({
    table: metadataConfig.tables.metadata__ResourceTag,
    worldAddress,
    chainId,
    indexerUrl,
    client,
    fromBlock,
    toBlock,
  });

  const abi = Object.fromEntries([
    ...systemIds.map((id) => [id, []]),
    ...records
      .filter(({ resource, tag }) => hexToString(tag).replace(/\0+$/, "") === "abi" && systemIds.includes(resource))
      .map(({ resource, value }) => [resource, value === "0x" ? [] : hexToString(value).split("\n").map(parseAbiItem)]),
  ]) as Record<string, Abi>;

  return abi;
}
