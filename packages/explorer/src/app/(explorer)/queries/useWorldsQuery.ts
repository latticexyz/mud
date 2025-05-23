import { useParams } from "next/navigation";
import { Address, getAddress } from "viem";
import { useMemo } from "react";
import { MUDChain } from "@latticexyz/common/chains";
import { useQuery } from "@tanstack/react-query";
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

export type WorldsQueryState = {
  data: WorldsQueryResult;
  isLoading: {
    verified: boolean;
    indexer: boolean;
  };
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
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

function useVerifiedWorldsQuery(chain: MUDChain) {
  return useQuery({
    queryKey: ["verifiedWorlds", chain.id],
    queryFn: async () => {
      try {
        const verifiedWorlds = await getVerifiedWorlds(chain);
        return new Map(verifiedWorlds.map((world) => [world.address, world.name]));
      } catch (error) {
        console.error("Failed to fetch verified worlds:", error);
        return new Map<Address, string>();
      }
    },
    refetchInterval: 5000,
  });
}

function useIndexerWorldsQuery(chain: MUDChain, indexer: ReturnType<typeof useIndexerForChainId>) {
  return useQuery({
    queryKey: ["indexerWorlds", chain.id, indexer.type],
    queryFn: async () => {
      if (indexer.type === "sqlite") {
        return await getLocalWorlds(indexer);
      } else {
        return await getExternalWorlds(chain);
      }
    },
    refetchInterval: 5000,
  });
}

export function useWorldsQuery(): WorldsQueryState {
  const { chainName } = useParams();
  validateChainName(chainName);
  const chain = supportedChains[chainName];
  const indexer = useIndexerForChainId(chain.id);

  const verifiedWorldsQuery = useVerifiedWorldsQuery(chain);
  const indexerWorldsQuery = useIndexerWorldsQuery(chain, indexer);

  const result = useMemo(() => {
    const worlds: WorldSelectItem[] = [];
    const worldsAddresses = new Set<Address>();

    if (verifiedWorldsQuery.data) {
      for (const [address, name] of verifiedWorldsQuery.data) {
        worldsAddresses.add(address);
        worlds.push({ address, name, verified: true });
      }
    }

    if (indexerWorldsQuery.data) {
      for (const world of indexerWorldsQuery.data) {
        if (!worldsAddresses.has(world)) {
          worlds.push({ address: world, name: "", verified: false });
        }
      }
    }

    return {
      worlds: worlds.sort((a) => (a.verified ? -1 : 1)),
    };
  }, [verifiedWorldsQuery.data, indexerWorldsQuery.data]);

  return {
    data: result,
    isLoading: {
      verified: verifiedWorldsQuery.isLoading,
      indexer: indexerWorldsQuery.isLoading,
    },
    isError: verifiedWorldsQuery.isError || indexerWorldsQuery.isError,
    error: verifiedWorldsQuery.error || indexerWorldsQuery.error,
    isSuccess: verifiedWorldsQuery.isSuccess || indexerWorldsQuery.isSuccess,
  };
}
