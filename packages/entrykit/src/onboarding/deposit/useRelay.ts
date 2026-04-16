import {
  RelayChain,
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  fetchChainConfigs,
  RelayClient,
  createClient,
  LogLevel,
} from "@reservoir0x/relay-sdk";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { debug } from "../../debug";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";

export function useRelay(): UseQueryResult<{ client: RelayClient; chains: RelayChain[] }> {
  const { chain } = useEntryKitConfig();
  const appOrigin = location.host;
  const baseApiUrl = chain.testnet ? TESTNET_RELAY_API : MAINNET_RELAY_API;

  return useQuery({
    queryKey: ["relayChains", baseApiUrl, appOrigin],
    queryFn: async () => {
      debug("fetching relay chains from", baseApiUrl);
      const chains = await fetchChainConfigs(baseApiUrl);

      debug("got relay chains", chains);
      const client = createClient({
        baseApiUrl,
        source: appOrigin,
        chains,
        logLevel: LogLevel.Verbose,
      });
      return { client, chains };
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
