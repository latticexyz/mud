import { Chain, Transport } from "viem";
import { WalletList, connectorsForWallets, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Config, CreateConfigParameters, createConfig } from "wagmi";
import { passkeyWallet } from "./passkey/passkeyWallet";
import { mapObject } from "@latticexyz/common/utils";
import { wiresaw } from "@latticexyz/wiresaw/internal";

export type CreateWagmiConfigOptions<
  chains extends readonly [Chain, ...Chain[]] = readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport> = Record<chains[number]["id"], Transport>,
> = {
  readonly chainId: number;
  readonly chains: chains;
  readonly transports: transports;
  /**
   * WalletConnect project ID, obtained from your WalletConnect dashboard.
   */
  // TODO: make optional and hide wallet options if so?
  readonly walletConnectProjectId: string;
  readonly appName: string;
} & Pick<CreateConfigParameters<chains, transports>, "pollingInterval">;

export function createWagmiConfig<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport>,
>(config: CreateWagmiConfigOptions<chains, transports>): Config<chains, transports> {
  const { wallets: defaultWallets } = getDefaultWallets();
  const wallets: WalletList = [
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

  const connectors = connectorsForWallets(wallets, {
    appName: config.appName,
    projectId: config.walletConnectProjectId,
  });

  return createConfig({
    connectors,
    chains: config.chains,
    transports: mapObject(config.transports, (transport) => wiresaw(transport)),
    pollingInterval: config.pollingInterval,
  }) as never;
}
