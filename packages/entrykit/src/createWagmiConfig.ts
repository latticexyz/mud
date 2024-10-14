import { Chain, Transport } from "viem";
import { EntryKitConfig } from "./config";
import { WalletList, connectorsForWallets, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { passkeyWallet } from "./passkey/passkeyWallet";

export type CreateWagmiConfigOptions<
  chains extends readonly [Chain, ...Chain[]] = readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport> = Record<chains[number]["id"], Transport>,
> = Pick<EntryKitConfig, "chainId" | "bundlerTransport" | "paymasterAddress"> & {
  readonly chains: chains;
  readonly transports: transports;
  readonly walletConnectProjectId: string;
  readonly appInfo: {
    readonly name: string;
  };
};

export function createWagmiConfig<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport>,
>(config: CreateWagmiConfigOptions<chains, transports>) {
  const { wallets: defaultWallets } = getDefaultWallets();
  const wallets: WalletList = [
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

  const connectors = connectorsForWallets(wallets, {
    appName: config.appInfo.name,
    projectId: config.walletConnectProjectId,
  });

  return createConfig({
    connectors,
    chains: config.chains,
    transports: config.transports,
  });
}
