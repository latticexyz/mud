import { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function createBurnerAccount(privateKey: Hex): PrivateKeyAccount {
  const account = privateKeyToAccount(privateKey);
  // We may override account features here
  return {
    ...account,
  };
}
