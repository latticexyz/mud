import type { WriteContractParameters, Chain, Account, WalletActions } from "viem";
import { sendTransaction, writeContract } from "viem/actions";
import { useAccount, useWalletClient, type UseWalletClientReturnType } from "wagmi";
import pRetry from "p-retry";
import { getNonceManager } from "@latticexyz/common";
import { useMUDNetwork, type MUDNetwork } from "./NetworkContext";

export const useMUD = () => {
  const network = useMUDNetwork();
  const { data: connectorWalletClient } = useWalletClient();
  const { chainId } = useAccount();

  let walletClient;
  if (network.publicClient.chain.id === chainId && connectorWalletClient?.chain.id === chainId) {
    // TODO: Should this be memoized?
    // `walletClient = connectorWalletClient.extend(burnerActions);` is unnecessary for an external wallet
    walletClient = connectorWalletClient.extend(setupObserverActions(network.onWrite));
  }

  return { network, walletClient };
};

// See @latticexyz/common/src/sendTransaction.ts
const burnerActions = (
  client: NonNullable<UseWalletClientReturnType["data"]>
): Pick<WalletActions<Chain, Account>, "sendTransaction"> => {
  const debug: typeof console.log = () => {}; // or `debug = console.log`

  return {
    sendTransaction: async (args) => {
      const nonceManager = await getNonceManager({
        client,
        address: client.account.address,
        blockTag: "pending",
      });

      return nonceManager.mempoolQueue.add(
        () =>
          pRetry(
            async () => {
              if (!nonceManager.hasNonce()) {
                await nonceManager.resetNonce();
              }

              const nonce = nonceManager.nextNonce();
              debug("sending tx with nonce", nonce, "to", args.to);
              return sendTransaction(client, { ...args, nonce } as typeof args);
            },
            {
              retries: 3,
              onFailedAttempt: async (error) => {
                // On nonce errors, reset the nonce and retry
                if (nonceManager.shouldResetNonce(error)) {
                  debug("got nonce error, retrying", error.message);
                  await nonceManager.resetNonce();
                  return;
                }
                // TODO: prepare again if there are gas errors?
                throw error;
              },
            }
          ),
        { throwOnTimeout: true }
      );
    },
  };
};

// See @latticexyz/common/src/getContract.ts
const setupObserverActions = (onWrite: MUDNetwork["onWrite"]) => {
  return (
    client: NonNullable<UseWalletClientReturnType["data"]>
  ): Pick<WalletActions<Chain, Account>, "writeContract"> => ({
    writeContract: async (args) => {
      const result = writeContract(client, args);

      const id = `${client.chain.id}:${client.account.address}`;
      onWrite({ id, request: args as WriteContractParameters, result });

      return result;
    },
  });
};
