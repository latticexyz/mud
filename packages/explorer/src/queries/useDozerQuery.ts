import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table } from "../app/(explorer)/worlds/[worldAddress]/dozer/DozerListener";
import { garnetHolesky } from "../chains";
import { ChainId } from "../hooks/useChainId";

function useDozerUrl(query: string | undefined) {
  const { worldAddress } = useParams();

  let dozerUrl;
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) as ChainId;
  if (chainId === garnetHolesky.id) {
    dozerUrl = "https://dozer.mud.garnetchain.com";
  } else {
    dozerUrl = "https://redstone2.dozer.skystrife.xyz";
  }

  return `${dozerUrl}/q-live?address=${worldAddress}&query=${query}`;
}

export function useDozerQuery(queryKey: string[], query: string | undefined) {
  const queryClient = useQueryClient();
  const dozerUrl = useDozerUrl(query);

  console.log("dozerUrl", dozerUrl);

  useEffect(() => {
    if (!query) return;

    const eventSource = new EventSource(dozerUrl);

    eventSource.onmessage = (event) => {
      const result = JSON.parse(event.data);
      const data = result.result[0];

      if (Array.isArray(data)) {
        const columns = data[0] || [];
        const rows = data.slice(1) || [];

        queryClient.setQueryData(queryKey, (oldData: { columns: string[]; rows: Table[] }) => {
          // TODO: add proper updater
          // const update = (entity) => (entity.id === data.id ? { ...entity, ...data.payload } : entity);

          if (columns.length > 0 || rows.length > 0) {
            return {
              columns,
              rows: [...oldData.rows, ...rows],
            };
          }

          return oldData;
        });
      }
    };

    eventSource.onopen = () => {
      console.log("event source opened:", queryKey);
    };

    eventSource.onerror = (err) => {
      console.error(err);
    };

    return () => {
      console.log("close event source:", queryKey);
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return useQuery({ queryKey, enabled: !!query, initialData: { columns: [], rows: [] } });
}
