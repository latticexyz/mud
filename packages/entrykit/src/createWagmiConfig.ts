import { Chain, Transport } from "viem";
import { Config, CreateConfigParameters, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";

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
  // TODO: wallets so we can extend with eventual passkey wallet
  const configParams = getDefaultConfig({
    chains: config.chains,
    transports: config.transports,
    pollingInterval: config.pollingInterval,
    appName: config.appName,
    walletConnectProjectId: config.walletConnectProjectId,
    enableFamily: false,
  });
  return createConfig(configParams) as never;
}
