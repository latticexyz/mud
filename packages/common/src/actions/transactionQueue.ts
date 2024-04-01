import type { Transport, Chain, Account, WalletActions, Client, PublicClient } from "viem";
import { writeContract as mud_writeContract } from "../writeContract";
import { sendTransaction as mud_sendTransaction } from "../sendTransaction";

export type TransactionQueueOptions<chain extends Chain> = {
  publicClient?: PublicClient<Transport, chain>;
};

export function transactionQueue<chain extends Chain, account extends Account>({
  publicClient,
}: TransactionQueueOptions<chain> = {}): (
  client: Client<Transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract" | "sendTransaction"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (args) => mud_writeContract(client, args, publicClient),
    // Applies to: `client.sendTransaction`
    sendTransaction: (args) => mud_sendTransaction(client, args),
  });
}
