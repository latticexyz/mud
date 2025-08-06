import { CreateConnectorFn } from "wagmi";
import { injected, coinbaseWallet, safe } from "wagmi/connectors";
import { walletConnect } from "./connectors/walletConnect";

export type GetDefaultConnectorsOptions = {
  /**
   * WalletConnect project ID, obtained from your WalletConnect dashboard.
   */
  // TODO: make optional and hide wallet options if so?
  readonly walletConnectProjectId: string;
  readonly appName: string;
};

export function getDefaultConnectors(config: GetDefaultConnectorsOptions): readonly CreateConnectorFn[] {
  // TODO: return ConnectKit's default connectors once https://github.com/wevm/wagmi/pull/4691 lands
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

  return connectors;
}
