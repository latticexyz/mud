import type { WriteContractParameters, Transport, Chain, Account, WalletActions, WalletClient } from "viem";
import { sendTransaction, writeContract } from "viem/actions";
import pRetry from "p-retry";
import { getNonceManager, type ContractWrite } from "@latticexyz/common";

// See @latticexyz/common/src/sendTransaction.ts
export const burnerActions = <transport extends Transport, chain extends Chain, account extends Account>(
  client: WalletClient<transport, chain, account>
): Pick<WalletActions<chain, account>, "sendTransaction"> => {
  // TODO: Use the `debug` library once this function has been moved to the `common` library.
  const debug = console.log;

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
export const setupObserverActions = (onWrite: (write: ContractWrite) => void) => {
  return <transport extends Transport, chain extends Chain, account extends Account>(
    client: WalletClient<transport, chain, account>
  ): Pick<WalletActions<chain, account>, "writeContract"> => ({
    writeContract: async (args) => {
      const result = writeContract(client, args);

      const id = `${client.chain.id}:${client.account.address}`;
      onWrite({ id, request: args as WriteContractParameters, result });

      return result;
    },
  });
};
