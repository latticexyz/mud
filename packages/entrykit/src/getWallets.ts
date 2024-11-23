import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { passkeyWallet } from "./passkey/passkeyWallet";

export function getWallets(config: { readonly chainId: number }): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    {
      groupName: "Recommended",
      wallets: [
        passkeyWallet({
          // TODO: allow any chain ID
          chainId: config.chainId,
        }),
      ],
    },
    ...defaultWallets,
  ];
}
