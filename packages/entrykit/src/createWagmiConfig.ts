import { Chain, Transport } from "viem";
import { Config, CreateConfigParameters, CreateConnectorFn, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { getDefaultConnectors } from "./getDefaultConnectors";

export type CreateWagmiConfigOptions<
  chains extends readonly [Chain, ...Chain[]] = readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport> = Record<chains[number]["id"], Transport>,
  connectorFns extends readonly CreateConnectorFn[] = readonly CreateConnectorFn[],
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
} & Pick<CreateConfigParameters<chains, transports, connectorFns>, "pollingInterval" | "connectors">;

export function createWagmiConfig<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport>,
  const connectorFns extends readonly CreateConnectorFn[] = readonly CreateConnectorFn[],
>(config: CreateWagmiConfigOptions<chains, transports, connectorFns>): Config<chains, transports, connectorFns> {
  const connectors = config.connectors ?? getDefaultConnectors(config);

  const configParams = getDefaultConfig({
    chains: config.chains,
    transports: config.transports,
    pollingInterval: config.pollingInterval,
    appName: config.appName,
    walletConnectProjectId: config.walletConnectProjectId,
    enableFamily: false,
    connectors,
  });

  return createConfig(configParams) as never;
}
