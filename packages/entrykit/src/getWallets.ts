import { WalletList, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { passkeyWallet } from "./passkey/passkeyWallet";

export function getWallets(config: {
  readonly chainId: number;
  readonly credentialOptions?: CredentialOptions;
}): WalletList {
  const { wallets: defaultWallets } = getDefaultWallets();
  return [
    {
      groupName: "Recommended",
      wallets: [
        passkeyWallet({
          // TODO: allow any chain ID
          chainId: config.chainId,
          credentialOptions: config.credentialOptions,
        }),
      ],
    },
    ...defaultWallets,
  ];
}
