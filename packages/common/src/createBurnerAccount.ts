import { Account, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function createBurnerAccount(privateKey: Hex): Account {
  const account = privateKeyToAccount(privateKey);

  // Temporarily override base fee for MUD's anvil config
  // TODO: remove once https://github.com/wagmi-dev/viem/pull/963 is fixed
  const signTransaction: typeof account.signTransaction = async (transaction, ...args) => {
    // TODO: refine check for mud anvil (0 base fee)
    if (transaction.chainId === 31337) {
      transaction.maxFeePerGas = 0n;
      transaction.maxPriorityFeePerGas = 0n;
    }
    return account.signTransaction(transaction, ...args);
  };

  return {
    ...account,
    signTransaction,
  };
}
