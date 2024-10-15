import { EntryKitConfig } from "./config";
import { WalletList, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getWallets } from "./getWallets";
import { CreateConnectorFn } from "wagmi";

export function getConnectors({
  wallets,
  ...config
}: EntryKitConfig & { readonly wallets?: WalletList }): CreateConnectorFn[] {
  return connectorsForWallets(wallets ?? getWallets(config), {
    appName: config.appInfo?.name ?? document.title,
    projectId: config.walletConnectProjectId,
  });
}
