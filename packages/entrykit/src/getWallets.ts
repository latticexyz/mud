import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";

export function getWallets(_config: {
  /**
   * The chain ID where the world is deployed, for chain-bound, smart contract wallets.
   */
  readonly chainId: number;
}): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    // TODO: passkey wallet
    ...defaultWallets,
  ];
}
