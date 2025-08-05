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
  ExactPartial,
  Hex,
} from "viem";
import { Chains, Porto, RpcSchema } from "porto";
// TODO: import from porto once exported?
import * as Schema from "../../node_modules/porto/core/internal/schema/schema";
import { rp } from "../common";

// TODO: PR to porto to let us change name + icon?

export type Provider = ReturnType<typeof Porto.create>["provider"];
export type Properties = {
  connect(parameters?: {
    chainId?: number | undefined;
    isReconnecting?: boolean | undefined;
    capabilities?:
      | (RpcSchema.wallet_connect.Capabilities & {
          force?: boolean | undefined;
        })
      | undefined;
  }): Promise<{
    accounts: readonly Address[];
    chainId: number;
  }>;
  onConnect(connectInfo: ProviderConnectInfo): void;

  sign(params: { hash: Hex; account: Address }): Promise<Hex>;
};

export type PortoConnector = Connector<CreateConnectorFn<Provider, Properties>>;

export function porto<const chains extends readonly [Chains.Chain, ...Chains.Chain[]]>(
  config: ExactPartial<Porto.Config<chains>> = {},
): CreateConnectorFn<Provider, Properties> {
  return createConnector<Provider, Properties>((wagmiConfig) => {
    const chains = config.chains ?? wagmiConfig.chains ?? [];

    const transports = (() => {
      if (config.transports) return config.transports;
      return wagmiConfig.transports;
    })();

    const porto = Porto.create({
      ...config,
      announceProvider: false,
      chains: chains as never,
      transports,
    });

    let accountsChanged: Connector["onAccountsChanged"] | undefined;
    let chainChanged: Connector["onChainChanged"] | undefined;
    let connect: Connector["onConnect"] | undefined;
    let disconnect: Connector["onDisconnect"] | undefined;

    return {
      type: "injected",
      id: rp.id,
      name: rp.name,
      icon: `data:image/svg+xml;base64,${btoa(icon)}`,

      async connect({ chainId, isReconnecting, ...rest } = {}) {
        let accounts: readonly Address[] = [];
        if (isReconnecting) accounts = await this.getAccounts().catch(() => []);

        const provider = await this.getProvider();

        try {
          if (!accounts?.length && !isReconnecting) {
            const params = (() => {
              if (!("capabilities" in rest)) return undefined;
              return [
                {
                  capabilities: Schema.encodeSync(RpcSchema.wallet_connect.Capabilities)(rest.capabilities ?? {}),
                },
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
            // Porto Provider uses Ox, which uses `readonly Address.Address[]` for `accountsChanged`,
            // while Connector `accountsChanged` is `string[]`
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
        return porto.provider;
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
            // Porto Provider uses Ox, which uses `readonly Address.Address[]` for `accountsChanged`,
            // while Connector `accountsChanged` is `string[]`
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

      async sign({ hash, account }) {
        const provider = await this.getProvider();
        return await provider.request({
          method: "personal_sign",
          params: [hash, account],
        });
      },
    };
  });
}

export function isPortoConnector(connector: Connector): connector is PortoConnector {
  return connector.id === rp.id;
}

/* eslint-disable max-len */
const icon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <rect width="100%" height="100%" fill="#e0e7ff" />

    <svg
      x="5"
      y="5"
      width="50"
      height="50"
      viewBox="-5 0 50 40"
    >
      <path
        d="M5 0H0v5h5V0ZM5 5H0v5h5V5ZM5 10H0v5h5v-5ZM5 15H0v5h5v-5ZM5 20H0v5h5v-5ZM5 25H0v5h5v-5ZM5 30H0v5h5v-5ZM5 35H0v5h5v-5ZM10 35H5v5h5v-5ZM15 35h-5v5h5v-5ZM20 35h-5v5h5v-5ZM25 35h-5v5h5v-5ZM30 35h-5v5h5v-5ZM40 30h-5v5h5v-5ZM40 35h-5v5h5v-5ZM35 35h-5v5h5v-5ZM40 5h-5v5h5V5ZM10 0H5v5h5V0ZM15 0h-5v5h5V0ZM20 0h-5v5h5V0ZM25 0h-5v5h5V0ZM30 0h-5v5h5V0ZM35 0h-5v5h5V0ZM40 0h-5v5h5V0Z"
        fill="#000"
      />
      <path
        d="M30 10h-5v5h5v-5ZM30 15h-5v5h5v-5ZM30 20h-5v5h5v-5ZM30 25h-5v5h5v-5ZM35 10h-5v5h5v-5ZM35 25h-5v5h5v-5ZM45 10h-5v5h5v-5ZM45 15h-5v5h5v-5ZM45 20h-5v5h5v-5ZM45 25h-5v5h5v-5ZM40 10h-5v5h5v-5ZM40 25h-5v5h5v-5Z"
        fill="#4f39f6"
      />
    </svg>

  </svg>
`;
/* eslint-enable max-len */
