import { EntryKitConfig } from "./config";
import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { passkeyWallet } from "./passkey/passkeyWallet";

export function getWallets(config: EntryKitConfig): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    {
      groupName: "Recommended",
      wallets: [
        passkeyWallet({
          // TODO: allow any chain ID
          chainId: config.chainId,
          bundlerTransport: config.bundlerTransport,
          paymasterAddress: config.paymasterAddress,
        }),
      ],
    },
    ...defaultWallets,
  ];
}
