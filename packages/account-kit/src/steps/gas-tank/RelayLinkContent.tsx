import { useWalletClient } from "wagmi";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useEffect } from "react";

import {
  getClient,
  createClient,
  convertViemChainToRelayChain,
  // MAINNET_RELAY_API,
  TESTNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import { holesky } from "viem/chains";
import { zeroAddress } from "viem";

// TODO: move elsewhere?
createClient({
  baseApiUrl: TESTNET_RELAY_API,
  source: "YOUR.SOURCE", // TODO: what should be set as source?
  chains: [convertViemChainToRelayChain(holesky)],
});

const CHAIN_FROM = 17000;
const CHAIN_TO = 17069;
// const CHAIN_TO = 84532; // Base Sepolia

export function RelayLinkContent() {
  const wallet = useWalletClient();

  const getSolver = async () => {
    const client = getClient();
    const { solver, enabled } = await client.methods.getSolverCapacity({
      originChainId: String(CHAIN_FROM), // The chain id to bridge from
      destinationChainId: String(CHAIN_TO), // The chain id to bridge to
      currency: zeroAddress,
    });

    console.log("solver:", solver);
    console.log("enabled:", enabled);

    return { solver, enabled };
  };

  const getBridgeQuote = useCallback(async () => {
    const quote = await getClient()?.methods.getBridgeQuote({
      wallet: wallet.data,
      chainId: CHAIN_FROM, // The chain id to bridge from
      toChainId: CHAIN_TO, // The chain id to bridge to
      amount: "100000000000000", // Amount in wei to bridge
      currency: "eth", // `eth` | `usdc`
      // TODO: call `depositTo`
      recipient: zeroAddress, // A valid address to send the funds to
    });

    console.log("quote", quote);
  }, [wallet.data]);

  const executeBridge = useCallback(async () => {
    if (!wallet.data) return;

    await getClient()?.actions.bridge({
      wallet: wallet.data,
      chainId: CHAIN_FROM, // The chain id to bridge from
      toChainId: CHAIN_TO, // The chain id to bridge to
      amount: "100000000000000000", // Amount in wei to bridge
      currency: "eth", // `eth` | `usdc`
      recipient: wallet.data.account.address, // A valid address to send the funds to
      onProgress: (steps, fees, currentStep, currentStepItem) => {
        console.log(steps, fees, currentStep, currentStepItem);
      },
    });
  }, [wallet.data]);

  useEffect(() => {
    getSolver();
    getBridgeQuote();
    executeBridge();
  }, [getBridgeQuote, executeBridge]);

  return (
    <AccountModalContent title="Relay.link balance top-up">
      <div className="flex flex-col gap-2">Relay.link is going to be here</div>
    </AccountModalContent>
  );
}
