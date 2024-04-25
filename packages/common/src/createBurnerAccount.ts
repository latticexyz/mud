import { Account, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function createBurnerAccount(privateKey: Hex): Account {
  const account = privateKeyToAccount(privateKey);
  // We may override account features here
  return {
    ...account,
  };
}
