import type { Transport, Chain, Account, WalletActions, WalletClient } from "viem";
import { writeContract as mud_writeContract } from "./writeContract";
import { sendTransaction as mud_sendTransaction } from "./sendTransaction";

export const transactionQueueActions = <TChain extends Chain, TAccount extends Account>(
  client: WalletClient<Transport, TChain, TAccount>
): Pick<WalletActions<TChain, TAccount>, "writeContract" | "sendTransaction"> => {
  return {
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (args) => mud_writeContract(client, args),
    // Applies to: `client.sendTransaction`
    sendTransaction: (args) => mud_sendTransaction(client, args),
  };
};
