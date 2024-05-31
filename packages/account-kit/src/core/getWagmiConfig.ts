import { CreateConfigParameters, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { defaultChains } from "./defaultChains";

// TODO: figure out how to add client support
export type GetWagmiConfigOptions = Partial<Omit<CreateConfigParameters, "client">>;

export function getWagmiConfig({ ...opts }: GetWagmiConfigOptions = {}): CreateConfigParameters {
  const chains = opts.chains ?? (defaultChains as readonly [Chain, ...Chain[]]);
  // We intentionally don't use fallback with webSocket here because if a chain's RPC config
  // doesn't include a `webSocket` entry, it doesn't seem to fallback and instead just
  // ~never makes any requests and all queries seem to sit idle. Also http is generally more
  // stable/reliable than webSocket transport.
  //
  // The Viem clients returned from Account Kit may use their own optimized transports anyway.
  const transports = opts.transports ?? Object.fromEntries(chains.map((chain) => [chain.id, http()]));

  // TODO: default connectors

  return { ...opts, chains, transports };
}

export type getWagmiConfig = typeof getWagmiConfig;
