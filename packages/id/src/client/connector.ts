import { ChainNotConfiguredError, type Connector, createConnector, CreateConnectorFn } from "wagmi";
import {
  type Address,
  getAddress,
  numberToHex,
  type ProviderConnectInfo,
  type RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  withRetry,
  Chain,
} from "viem";
import { createProvider } from "./createProvider";

const id = "id.place";

type Provider = ReturnType<typeof createProvider>["provider"];
type Properties = {
  connect(parameters?: {
    chainId?: number | undefined;
    isReconnecting?: boolean | undefined;
    // capabilities?:
    //   | (RpcSchema.wallet_connect.Capabilities & {
    //       force?: boolean | undefined
    //     })
    //   | undefined
  }): Promise<{
    accounts: readonly Address[];
    chainId: number;
  }>;
  onConnect(connectInfo: ProviderConnectInfo): void;

  hasAccount: boolean;
  // accounts: readonly Account[];
  authCreate(): Promise<void>;
  authSign(): Promise<void>;
};
export type IdConnector = ReturnType<CreateConnectorFn<Provider, Properties>>;

export function isIdConnector(connector: ReturnType<CreateConnectorFn> | undefined): connector is IdConnector {
  return connector?.id === id;
}

// TODO: rename
export function idConnector<const chains extends readonly [Chain, ...Chain[]]>(
  config: {
    chains?: chains;
    // TODO: fix type
    transports?: {};
  } = {},
) {
  return createConnector<Provider, Properties>((wagmiConfig) => {
    const chains = config.chains ?? wagmiConfig.chains ?? [];
    const transports = config.transports ?? wagmiConfig.transports;

    const providerContainer = createProvider({
      chains,
      transports,
    });

    let accountsChanged: Connector["onAccountsChanged"] | undefined;
    let chainChanged: Connector["onChainChanged"] | undefined;
    let connect: Connector["onConnect"] | undefined;
    let disconnect: Connector["onDisconnect"] | undefined;

    let hasAccount = false;

    return {
      type: "injected",
      id,
      name: "id.place",
      icon: `data:image/svg+xml;base64,${btoa(icon)}`,
      hasAccount,
      async authCreate() {
        await providerContainer.provider.request({
          method: "wallet_connect",
        });
      },
      async authSign() {
        throw new Error("not implemented");
      },
      async connect({ chainId, isReconnecting, ...rest } = {}) {
        let accounts: readonly Address[] = [];
        if (isReconnecting) accounts = await this.getAccounts().catch(() => []);

        const provider = await this.getProvider();

        try {
          if (!accounts?.length && !isReconnecting) {
            const params = (() => {
              if (!("capabilities" in rest)) return undefined;
              return [
                // {
                //   capabilities: Schema.encodeSync(RpcSchema.wallet_connect.Capabilities)(rest.capabilities ?? {}),
                // },
              ] as const;
            })();
            const res = await provider.request({
              method: "wallet_connect",
              ...(params ? { params } : {}),
            });
            accounts = res.accounts.map((x) => getAddress(x.address));
          }

          // Manage EIP-1193 event listeners
          // https://eips.ethereum.org/EIPS/eip-1193#events
          if (connect) {
            provider.removeListener("connect", connect);
            connect = undefined;
          }
          if (!accountsChanged) {
            accountsChanged = this.onAccountsChanged.bind(this);
            provider.on("accountsChanged", accountsChanged as never);
          }
          if (!chainChanged) {
            chainChanged = this.onChainChanged.bind(this);
            provider.on("chainChanged", chainChanged);
          }
          if (!disconnect) {
            disconnect = this.onDisconnect.bind(this);
            provider.on("disconnect", disconnect);
          }

          // Switch to chain if provided
          let currentChainId = await this.getChainId();
          if (chainId && currentChainId !== chainId) {
            const chain = await this.switchChain!({ chainId }).catch((error) => {
              if (error.code === UserRejectedRequestError.code) throw error;
              return { id: currentChainId };
            });
            currentChainId = chain?.id ?? currentChainId;
          }

          return { accounts, chainId: currentChainId };
        } catch (err) {
          const error = err as RpcError;
          if (error.code === UserRejectedRequestError.code) throw new UserRejectedRequestError(error);
          throw error;
        }
      },
      async disconnect() {
        const provider = await this.getProvider();

        if (chainChanged) {
          provider.removeListener("chainChanged", chainChanged);
          chainChanged = undefined;
        }
        if (disconnect) {
          provider.removeListener("disconnect", disconnect);
          disconnect = undefined;
        }
        if (!connect) {
          connect = this.onConnect.bind(this);
          provider.on("connect", connect);
        }

        await provider.request({ method: "wallet_disconnect" });
      },
      async getAccounts() {
        const provider = await this.getProvider();
        const accounts = await provider.request({
          method: "eth_accounts",
        });
        hasAccount = !!accounts.length;
        return accounts.map((x) => getAddress(x));
      },
      async getChainId() {
        const provider = await this.getProvider();
        const hexChainId = await provider.request({
          method: "eth_chainId",
        });
        return Number(hexChainId);
      },
      async getProvider() {
        return providerContainer.provider;
      },
      async isAuthorized() {
        try {
          // Use retry strategy as some injected wallets (e.g. MetaMask) fail to
          // immediately resolve JSON-RPC requests on page load.
          const accounts = await withRetry(() => this.getAccounts());
          return !!accounts.length;
        } catch {
          return false;
        }
      },
      async onAccountsChanged(accounts) {
        wagmiConfig.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
      },
      onChainChanged(chain) {
        const chainId = Number(chain);
        wagmiConfig.emitter.emit("change", { chainId });
      },
      async onConnect(connectInfo) {
        const accounts = await this.getAccounts();
        if (accounts.length === 0) return;

        const chainId = Number(connectInfo.chainId);
        wagmiConfig.emitter.emit("connect", { accounts, chainId });

        // Manage EIP-1193 event listeners
        const provider = await this.getProvider();
        if (provider) {
          if (connect) {
            provider.removeListener("connect", connect);
            connect = undefined;
          }
          if (!accountsChanged) {
            accountsChanged = this.onAccountsChanged.bind(this);
            provider.on("accountsChanged", accountsChanged as never);
          }
          if (!chainChanged) {
            chainChanged = this.onChainChanged.bind(this);
            provider.on("chainChanged", chainChanged);
          }
          if (!disconnect) {
            disconnect = this.onDisconnect.bind(this);
            provider.on("disconnect", disconnect);
          }
        }
      },
      async onDisconnect(_error) {
        const provider = await this.getProvider();

        wagmiConfig.emitter.emit("disconnect");

        // Manage EIP-1193 event listeners
        if (provider) {
          if (chainChanged) {
            provider.removeListener("chainChanged", chainChanged);
            chainChanged = undefined;
          }
          if (disconnect) {
            provider.removeListener("disconnect", disconnect);
            disconnect = undefined;
          }
          if (!connect) {
            connect = this.onConnect.bind(this);
            provider.on("connect", connect);
          }
        }
      },
      async setup() {
        if (!connect) {
          const provider = await this.getProvider();
          connect = this.onConnect.bind(this);
          provider.on("connect", connect);
        }
      },
      async switchChain({ chainId }) {
        const chain = chains.find((x) => x.id === chainId);
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

        const provider = await this.getProvider();
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: numberToHex(chainId) }],
        });

        return chain;
      },
    };
  });
}

/* eslint-disable max-len */
const icon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
    <rect width="100%" height="100%" fill="white" />
    <svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24" fill="black" shape-rendering="crispEdges">
      <path d="M2 3H0v18h24V3H2zm20 2v14H2V5h20zM10 7H6v4h4V7zm-6 6h8v4H4v-4zm16-6h-6v2h6V7zm-6 4h6v2h-6v-2zm6 4h-6v2h6v-2z" />
    </svg>
  </svg>
`;
/* eslint-enable max-len */
