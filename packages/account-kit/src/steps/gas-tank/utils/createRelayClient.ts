import { createClient, convertViemChainToRelayChain, TESTNET_RELAY_API } from "@reservoir0x/relay-sdk";
import { holesky } from "viem/chains";

export const createRelayClient = () => {
  createClient({
    baseApiUrl: TESTNET_RELAY_API,
    source: window.location.hostname,
    chains: [convertViemChainToRelayChain(holesky)],
  });
};
