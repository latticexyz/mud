import { createContext, useContext, type ReactNode } from "react";
import { EntryKitConfig } from "./config/output";
import { Chain } from "viem";
import { useChains } from "wagmi";
import { getBundlerTransport } from "./getBundlerTransport";
import { ConnectKitProvider } from "connectkit";

type ContextValue = EntryKitConfig & {
  chain: Chain;
};

/** @internal */
const Context = createContext<ContextValue | null>(null);

export type Props = {
  config: EntryKitConfig;
  children?: ReactNode;
};

export function EntryKitConfigProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`EntryKitProvider` can only be used once.");

  // TODO: move chain-based lookups to function so we can reuse here and in passkeyConnector

  const chains = useChains();
  const chain = chains.find(({ id }) => id === config.chainId);
  if (!chain) throw new Error(`Could not find configured chain for chain ID ${config.chainId}.`);

  // This throws when no we can't find a bundler to talk to, so use it to validate the chain.
  getBundlerTransport(chain);

  return (
    <ConnectKitProvider
      theme="midnight"
      options={{
        // Prevent Wagmi trying to switch chains after connection
        // https://github.com/wevm/wagmi/blob/f5b717ccf8a5b283263cadc984ba00b354bcefae/packages/core/src/connectors/injected.ts#L174-L182
        initialChainId: 0,
      }}
    >
      <Context.Provider value={{ ...config, chain }}>{children}</Context.Provider>
    </ConnectKitProvider>
  );
}

export function useEntryKitConfig(): ContextValue {
  const config = useContext(Context);
  if (!config) throw new Error("`useEntryKitConfig` can only be used within a `EntryKitProvider`.");
  return config;
}
