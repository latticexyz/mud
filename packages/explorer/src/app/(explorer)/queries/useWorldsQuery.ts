import { useParams } from "next/navigation";
import { Hex } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { supportedChains, validateChainName } from "../../../common";
import { useIndexerForChainId } from "../hooks/useIndexerForChainId";

type WorldsQueryResult = {
  worlds: Hex[];
};

type ApiResponse = {
  items: Array<{ address: { hash: Hex } }>;
};

type SqliteResponse = {
  result: [string[], ...string[][]];
};

export function useWorldsQuery(): UseQueryResult<WorldsQueryResult> {
  const { chainName } = useParams();
  validateChainName(chainName);
  const chain = supportedChains[chainName];
  const indexer = useIndexerForChainId(chain.id);

  return useQuery({
    queryKey: ["worlds", chainName],
    queryFn: async () => {
      if (indexer.type === "sqlite") {
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
          return { worlds: [] };
        }

        const rows = result.slice(1);
        return {
          worlds: rows.map((row) => row[0] as Hex),
        };
      } else if ("blockExplorers" in chain && chain.blockExplorers?.default.url) {
        const worldsApiUrl = `${chain.blockExplorers.default.url}/api/v2/mud/worlds`;
        const response = await fetch(worldsApiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        return {
          worlds: data.items.map((world) => world.address.hash),
        };
      }

      return { worlds: [] };
    },
    refetchInterval: 5000,
  });
}
