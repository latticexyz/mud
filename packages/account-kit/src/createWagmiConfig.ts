import { CreateConfigParameters, http, webSocket } from "wagmi";
import { Chain } from "wagmi/chains";
import { defaultChains } from "./defaultChains";

// TODO: figure out how to add client support
export type CreateWagmiConfigOptions = Partial<Omit<CreateConfigParameters, "client">>;

export function createWagmiConfig({ ...opts }: CreateWagmiConfigOptions): CreateConfigParameters {
  // TODO: add connectors
  const chains = opts.chains ?? (defaultChains as readonly [Chain, ...Chain[]]);
  const transports =
    opts.transports ??
    Object.fromEntries(
      chains.map((chain) => [
        chain.id,
        chain.rpcUrls.default.webSocket?.length
          ? webSocket(chain.rpcUrls.default.webSocket[0])
          : chain.rpcUrls.default.http?.length
            ? http(chain.rpcUrls.default.http[0])
            : http(),
      ]),
    );
  return { ...opts, chains, transports };
}

export type createWagmiConfig = typeof createWagmiConfig;
