import type { Transport, Chain, Account, WalletActions, Client } from "viem";
import { writeContract as mud_writeContract } from "../writeContract";
import { sendTransaction as mud_sendTransaction } from "../sendTransaction";

export type TransactionQueueOptions<chain extends Chain> = {
  /**
   * `publicClient` can be provided to be used in place of the extended viem client for making public action calls
   * (`getChainId`, `getTransactionCount`, `simulateContract`, `call`). This helps in cases where the extended
   * viem client is a smart account client, like in [permissionless.js](https://github.com/pimlicolabs/permissionless.js),
   * where the transport is the bundler, not an RPC.
   */
  publicClient?: Client<Transport, chain>;
  /**
   * Adjust the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered
   * and nonces are handled properly. Any number greater than that is likely to see nonce errors and/or transactions
   * arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.
   * @default 1
   */
  queueConcurrency?: number;
};

export function transactionQueue<chain extends Chain>(
  opts: TransactionQueueOptions<chain> = {},
): <transport extends Transport, account extends Account | undefined = Account | undefined>(
  client: Client<transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract" | "sendTransaction"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (args) => mud_writeContract(client, args, opts),
    // Applies to: `client.sendTransaction`
    sendTransaction: (args) => mud_sendTransaction(client, args, opts),
  });
}
