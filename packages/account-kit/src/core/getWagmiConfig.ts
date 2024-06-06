import { CreateConfigParameters, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { defaultChains } from "./defaultChains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export type GetWagmiConfigOptions = {
  chains?: CreateConfigParameters["chains"];
  walletConnectProjectId?: string;
};

export function getWagmiConfig(opts: GetWagmiConfigOptions = {}): CreateConfigParameters {
  const chains = opts.chains ?? (defaultChains as readonly [Chain, ...Chain[]]);

  // We intentionally don't use fallback with webSocket here because if a chain's RPC config
  // doesn't include a `webSocket` entry, it doesn't seem to fallback and instead just
  // ~never makes any requests and all queries seem to sit idle. Also http is generally more
  // stable/reliable than webSocket transport.
  //
  // The Viem clients returned from Account Kit may use their own optimized transports anyway.
  const transports = Object.fromEntries(chains.map((chain) => [chain.id, http()]));

  // TODO: move this out into `getDefaultConnectors` or similar?
  // TODO: add some sort of wallet abstraction over connectors so we have more metadata to work with?
  const connectors = [
    injected(),
    coinbaseWallet(),
    ...(opts.walletConnectProjectId ? [walletConnect({ projectId: opts.walletConnectProjectId })] : []),
  ];

  return { chains, transports, connectors };
}

export type getWagmiConfig = typeof getWagmiConfig;
