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
import { useAppChain } from "../../useAppChain";
import { useAppInfo } from "../../useAppInfo";

export function useRelay(): UseQueryResult<{ client: RelayClient; chains: RelayChain[] }> {
  const appChain = useAppChain();
  const appInfo = useAppInfo();
  const baseApiUrl = appChain.testnet ? TESTNET_RELAY_API : MAINNET_RELAY_API;
  return useQuery({
    queryKey: ["relayChains", baseApiUrl],
    queryFn: async () => {
      debug("fetching relay chains from", baseApiUrl);
      const chains = await fetchChainConfigs(baseApiUrl);
      console.log("chains are:", chains);

      // TODO: call getSolverCapacity to make sure source relay chain to app chain is supported
      //       this might also help with our balance checking, because this returns a balance as well
      debug("got relay chains", chains);
      const client = createClient({
        baseApiUrl,
        source: appInfo.appOrigin,
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
