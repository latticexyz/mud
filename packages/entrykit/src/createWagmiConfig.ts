import { Chain, Transport } from "viem";
import { Config, CreateConfigParameters, CreateConnectorFn, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { injected, coinbaseWallet, safe } from "wagmi/connectors";
import { walletConnect } from "./connectors/walletConnect";

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
  // TODO: remove connectors and use ConnectKit's default once https://github.com/wevm/wagmi/pull/4691 lands
  const connectors: CreateConnectorFn[] = [];

  // If we're in an iframe, include the SafeConnector
  const shouldUseSafeConnector = !(typeof window === "undefined") && window?.parent !== window;
  if (shouldUseSafeConnector) {
    connectors.push(
      safe({
        allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      }),
    );
  }

  connectors.push(
    injected({ target: "metaMask" }),
    coinbaseWallet({
      appName: config.appName,
      overrideIsMetaMask: false,
    }),
  );

  if (config.walletConnectProjectId) {
    connectors.push(
      walletConnect({
        showQrModal: false,
        projectId: config.walletConnectProjectId,
      }),
    );
  }

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
