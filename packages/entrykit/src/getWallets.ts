import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { jwtWallet } from "./jwt/jwtWallet";

export function getWallets(config: { readonly chainId: number }): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    {
      groupName: "Recommended",
      wallets: [
        jwtWallet({
          // TODO: allow any chain ID
          chainId: config.chainId,
        }),
      ],
    },
    ...defaultWallets,
  ];
}
