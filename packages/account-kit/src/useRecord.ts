import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { GetRecordOptions, getRecord } from "./utils/getRecord";
import { Table } from "@latticexyz/config";
import { schemaToPrimitives } from "./utils/schemaToPrimitives";
import { usePublicClient } from "wagmi";
import { useConfig } from "./MUDAccountKitProvider";

export type UseRecordOptions<table extends Table> = GetRecordOptions<table> & {
  query: Omit<UseQueryOptions<typeof getRecord<table>>, "queryKey" | "queryFn">;
};

export function getRecordKey<table extends Table>(
  data: {
    chainId: number;
  } & GetRecordOptions<table>,
) {
  return ["mud:getRecord", data] as const;
}

export function useRecord<table extends Table>(
  args: GetRecordOptions<table>,
  query: Omit<UseQueryOptions<schemaToPrimitives<table["schema"]>>, "queryKey" | "queryFn"> = {},
): UseQueryResult<schemaToPrimitives<table["schema"]>> {
  // TODO: move this "app chain's publicClient" logic into a hook that we can use everywhere
  const { chain } = useConfig();
  const publicClient = usePublicClient({ chainId: chain.id });
  if (!publicClient) {
    throw new Error(`No public client available for chain ${chain.id}. Is wagmi properly configured with this chain?`);
  }

  return useQuery({
    ...query,
    queryKey: getRecordKey({ chainId: chain.id, ...args }),
    queryFn: () => getRecord(publicClient, args),
  });
}
