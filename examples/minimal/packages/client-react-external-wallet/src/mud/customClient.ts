import type {
  WriteContractParameters,
  Transport,
  Chain,
  Account,
  Client,
  WalletRpcSchema,
  WalletActions,
  PublicRpcSchema,
  PublicActions,
  WalletClient,
} from "viem";
import { sendTransaction, writeContract, simulateContract } from "viem/actions";
import pRetry from "p-retry";
import { type Subject } from "rxjs";
import { getNonceManager, type ContractWrite } from "@latticexyz/common";
import { type SyncResult } from "@latticexyz/store-sync";

const burnerBlockTag = "pending";

// See @latticexyz/common/src/sendTransaction.ts
export const burnerActions = <transport extends Transport, chain extends Chain, account extends Account>(
  // The client must be extended with wallet and public actions.
  // https://viem.sh/docs/accounts/local#optional-extend-with-public-actions
  client: Client<
    transport,
    chain,
    account,
    WalletRpcSchema & PublicRpcSchema,
    WalletActions<chain, account> & PublicActions<transport, chain>
  >
): Pick<WalletActions<chain, account>, "sendTransaction"> &
  Pick<PublicActions<transport, chain>, "simulateContract"> => {
  // TODO: Use the `debug` library once this function has been moved to the `common` library.
  const debug = console.log;

  return {
    // Applies to: `client.(sendTransaction|writeContract)`, `getContract(client, ...).write`
    sendTransaction: async (args) => {
      const nonceManager = await getNonceManager({
        client,
        address: client.account.address,
        blockTag: burnerBlockTag,
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
    // Applies to: `client.simulateContract`, `getContract(client, ...).simulate`
    simulateContract: (args) => simulateContract(client, { ...args, blockTag: burnerBlockTag } as typeof args),
  };
};

// See @latticexyz/common/src/getContract.ts
export const setupObserverActions = (write$: Subject<ContractWrite>) => {
  let nextWriteId = 0;

  return <transport extends Transport, chain extends Chain, account extends Account>(
    client: WalletClient<transport, chain, account>
  ): Pick<WalletActions<chain, account>, "writeContract"> => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: async (args) => {
      const result = writeContract(client, args);

      const id = `${client.chain.id}:${client.account.address}:${nextWriteId++}`;
      write$.next({ id, request: args as WriteContractParameters, result });

      return result;
    },
  });
};

export const setupStoreSyncActions = (syncResult: SyncResult) => {
  return () => ({
    waitForStoreSync: syncResult.waitForTransaction,
  });
};
