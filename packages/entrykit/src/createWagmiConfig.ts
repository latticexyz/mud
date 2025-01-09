import { Chain, Transport } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { Config, CreateConfigParameters, createConfig } from "wagmi";
import { mapObject } from "@latticexyz/common/utils";
import { wiresaw } from "@latticexyz/wiresaw/internal";
import { CredentialOptions } from "./passkey/common";

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
  readonly credentialOptions?: CredentialOptions;
} & Pick<CreateConfigParameters<chains, transports>, "pollingInterval">;

export function createWagmiConfig<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]["id"], Transport>,
>(config: CreateWagmiConfigOptions<chains, transports>): Config<chains, transports> {
  const wallets = getWallets(config);

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
