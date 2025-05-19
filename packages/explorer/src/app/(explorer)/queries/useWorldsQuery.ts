import { useParams } from "next/navigation";
import { Address, getAddress } from "viem";
import { MUDChain } from "@latticexyz/common/chains";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { supportedChains, validateChainName } from "../../../common";
import { VerifiedWorld } from "../api/verified-worlds/route";
import { useIndexerForChainId } from "../hooks/useIndexerForChainId";

export type WorldSelectItem = {
  address: Address;
  name: string;
  verified: boolean;
};

export type WorldsQueryResult = {
  worlds: WorldSelectItem[];
};

type ApiResponse = {
  items: Array<{ address: { hash: Address } }>;
};

type SqliteResponse = {
  result: [string[], ...string[][]];
};

async function getVerifiedWorlds(chain: MUDChain): Promise<VerifiedWorld[]> {
  const response = await fetch(`/api/verified-worlds?chainId=${chain.id}`);
  const data = await response.json();
  return data;
}

async function getLocalWorlds(indexer: ReturnType<typeof useIndexerForChainId>) {
  const response = await fetch(indexer.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        query: "SELECT DISTINCT address FROM __mudStoreTables",
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: SqliteResponse = await response.json();
  const result = data.result[0];

  if (!result || !Array.isArray(result) || result.length < 2) {
    return [];
  }

  const rows = result.slice(1);
  return rows.map((row) => getAddress(row[0] as Address));
}

async function getExternalWorlds(chain: MUDChain) {
  if (!("blockExplorers" in chain) || !chain.blockExplorers?.default.url) {
    return [];
  }

  const worldsApiUrl = `${chain.blockExplorers.default.url}/api/v2/mud/worlds`;
  const response = await fetch(worldsApiUrl);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: ApiResponse = await response.json();
  return data.items.map((world) => getAddress(world.address.hash));
}

export function useWorldsQuery(): UseQueryResult<WorldsQueryResult> {
  const { chainName } = useParams();
  validateChainName(chainName);
  const chain = supportedChains[chainName];
  const indexer = useIndexerForChainId(chain.id);

  return useQuery({
    queryKey: ["worlds", chainName],
    queryFn: async () => {
      const worlds: WorldSelectItem[] = [];
      const worldsAddresses = new Set<Address>();

      let indexerWorlds: Address[] = [];
      if (indexer.type === "sqlite") {
        indexerWorlds = await getLocalWorlds(indexer);
      } else {
        indexerWorlds = await getExternalWorlds(chain);
      }

      for (const world of indexerWorlds) {
        worldsAddresses.add(world);
        worlds.push({ address: world, name: "", verified: false });
      }

      let verifiedWorldsMap = new Map<Address, string>();
      try {
        const verifiedWorlds = await getVerifiedWorlds(chain);
        verifiedWorldsMap = new Map(verifiedWorlds.map((world) => [world.address, world.name]));

        for (const [address, name] of verifiedWorldsMap) {
          if (!worldsAddresses.has(address)) {
            worlds.push({ address, name, verified: true });
          }
        }
      } catch (error) {
        console.error("Failed to fetch verified worlds:", error);
      }

      for (const world of worlds) {
        const name = verifiedWorldsMap.get(world.address);
        if (name) {
          world.name = name;
          world.verified = true;
        }
      }

      return {
        worlds: worlds.sort((a) => (a.verified ? -1 : 1)),
      };
    },
    refetchInterval: 5000,
  });
}
