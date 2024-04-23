import { MAINNET_RELAY_API, TESTNET_RELAY_API, fetchChainConfigs } from "@reservoir0x/relay-sdk";
import { useQuery } from "@tanstack/react-query";
import { debug } from "../../debug";

export function useRelayChains() {
  return useQuery({
    queryKey: ["relayChains"],
    queryFn: async () => {
      debug("fetching relay chains");
      const chains = (
        await Promise.all([fetchChainConfigs(MAINNET_RELAY_API), fetchChainConfigs(TESTNET_RELAY_API)])
      ).flat();
      debug("got relay chains", chains);
      return chains;
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
