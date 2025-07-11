import { Client, Abi, Address, Hex, hexToString, parseAbi, stringToHex, toFunctionSelector } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecords } from "../getRecords";
import { getFunctions } from "./getFunctions";
import { groupBy, isNotNull } from "@latticexyz/common/utils";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";
import { hexToResource } from "@latticexyz/common";
import { isAbiFunction } from "./common";

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
  const [worldFunctions, { records: metadataRecords }] = await Promise.all([
    getFunctions({
      client,
      worldAddress,
      fromBlock,
      toBlock,
      indexerUrl,
      chainId,
    }),
    getRecords({
      table: metadataConfig.tables.metadata__ResourceTag,
      worldAddress,
      chainId,
      indexerUrl,
      client,
      fromBlock,
      toBlock,
    }),
  ]);

  const systemAbis = Object.fromEntries(
    metadataRecords
      .filter(({ resource, tag }) => {
        const isAbiTag = tag === stringToHex("abi", { size: 32 });
        const matchesSystemId = systemIds ? systemIds.includes(resource) : hexToResource(resource).type === "system";
        return isAbiTag && matchesSystemId;
      })
      .map(({ resource, value }) => {
        try {
          const abi = value === "0x" ? [] : parseAbi(hexToString(value).split("\n"));
          return [resource, abi] as const;
        } catch (error) {
          console.error("error parsing system abi", error);
          return null;
        }
      })
      .filter(isNotNull),
  );

  const systemFunctions = Object.fromEntries(
    Array.from(
      groupBy(
        worldFunctions.filter(({ systemId }) => (systemIds ? systemIds.includes(systemId) : true)),
        ({ systemId }) => systemId,
      ).entries(),
    ).map(([systemId, functions]) => {
      return [systemId, functions.map((func) => functionSignatureToAbiItem(func.systemFunctionSignature))];
    }),
  );

  const ids = Array.from(new Set(systemIds ?? [...Object.keys(systemAbis), ...Object.keys(systemFunctions)]));

  const abis = Object.fromEntries(
    ids.map((systemId) => {
      const abi = systemAbis[systemId] ?? [];
      const abiSelectors = new Set(abi.filter(isAbiFunction).map(toFunctionSelector));
      const functions = systemFunctions[systemId] ?? [];
      return [systemId, [...abi, ...functions.filter((item) => !abiSelectors.has(toFunctionSelector(item)))]];
    }),
  );

  return abis;
}
