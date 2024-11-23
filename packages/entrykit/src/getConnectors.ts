import { WalletList, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getWallets } from "./getWallets";
import { CreateConnectorFn } from "wagmi";

export function getConnectors({
  wallets,
  ...config
}: {
  readonly chainId: number;
  /**
   * WalletConnect project ID, obtained from your WalletConnect dashboard.
   */
  // TODO: make optional and hide wallet options if so?
  readonly walletConnectProjectId: string;
  readonly appName: string;
} & { readonly wallets?: WalletList }): CreateConnectorFn[] {
  return connectorsForWallets(wallets ?? getWallets(config), {
    appName: config.appName,
    projectId: config.walletConnectProjectId,
  });
}
