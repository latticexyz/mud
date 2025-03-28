import { Client, Abi, Address, Hex, hexToString, parseAbi, stringToHex } from "viem";
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
  readonly systemIds?: Hex[];
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

  const abis = Object.fromEntries([
    ...(systemIds?.map((id) => [id, [] as Abi] as const) || []),
    ...records
      .filter(({ resource, tag }) => {
        const isAbiTag = tag === stringToHex("abi", { size: 32 });
        const matchesSystemId = systemIds ? systemIds.includes(resource) : true;
        return isAbiTag && matchesSystemId;
      })
      .map(({ resource, value }) => {
        const abi = value === "0x" ? [] : parseAbi(hexToString(value).split("\n"));
        return [resource, abi] as const;
      }),
  ]);

  return abis;
}
