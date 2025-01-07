import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";

export function getWallets(_config: { readonly chainId: number }): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    // TODO: passkey wallet
    ...defaultWallets,
  ];
}
