import { Chain, Transport } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { Config, CreateConfigParameters, createConfig } from "wagmi";

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
  const wallets = getWallets();
  const connectors = connectorsForWallets(wallets, {
    appName: config.appName,
    projectId: config.walletConnectProjectId,
  });

  return createConfig({
    connectors,
    chains: config.chains,
    transports: config.transports,
    pollingInterval: config.pollingInterval,
  }) as never;
}
