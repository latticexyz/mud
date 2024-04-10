import { useWalletClient } from "wagmi";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useEffect } from "react";
import PaymasterSystemABI from "../../abis/PaymasterSystem.json";

import {
  getClient,
  createClient,
  convertViemChainToRelayChain,
  // MAINNET_RELAY_API,
  TESTNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import { holesky } from "viem/chains";
import { createPublicClient, http, parseEther, zeroAddress } from "viem";

// TODO: move elsewhere?
createClient({
  baseApiUrl: TESTNET_RELAY_API,
  source: "YOUR.SOURCE", // TODO: set app URL as source
  chains: [convertViemChainToRelayChain(holesky)],
});

const CHAIN_FROM = 17000;
const CHAIN_TO = 17069;
const PAYMASTER_ADDRESS = "0xba0149DE3486935D29b0e50DfCc9e61BD40Ae095";

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

  const executeDeposit = useCallback(async () => {
    if (!wallet.data) return;

    const publicClient = createPublicClient({
      chain: holesky,
      transport: http(),
    });

    const { request } = await publicClient.simulateContract({
      address: PAYMASTER_ADDRESS,
      abi: PaymasterSystemABI,
      functionName: "depositTo",
      args: ["0x91102b828B5142a3C0365b3bED7A8D535DD51fBe"],
      value: parseEther("0.01"),
      account: wallet.data.account,
    });

    console.log("request 2:", request);

    const client = getClient();
    await client.actions.call({
      chainId: CHAIN_FROM,
      toChainId: CHAIN_TO,
      txs: [request],
      wallet: wallet.data,
      onProgress: () => {},
    });

    // await client.actions.bridge({
    //   wallet: wallet.data,
    //   chainId: CHAIN_FROM, // The chain id to bridge from
    //   toChainId: CHAIN_TO, // The chain id to bridge to
    //   amount: "10000000000000000", // Amount in wei to bridge
    //   currency: "eth", // `eth` | `usdc`
    //   recipient: wallet.data.account.address, // A valid address to send the funds to
    //   onProgress: (steps, fees, currentStep, currentStepItem) => {
    //     console.log(steps, fees, currentStep, currentStepItem);
    //   },
    // });
  }, [wallet.data]);

  useEffect(() => {
    getSolver();
    getBridgeQuote();
    executeDeposit();
  }, [getBridgeQuote, executeDeposit]);

  return (
    <AccountModalContent title="Relay.link balance top-up">
      <div className="flex flex-col gap-2">Relay.link is going to be here</div>
    </AccountModalContent>
  );
}
