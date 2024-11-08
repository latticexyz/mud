import {
  createClient,
  custom,
  EIP1193RequestFn,
  EIP1474Methods,
  getAddress,
  numberToHex,
  SwitchChainError,
  Client,
  ProviderConnectInfo,
} from "viem";
import { ChainNotConfiguredError, createConnector, CreateConnectorFn } from "wagmi";
import { cache } from "./cache";
import { smartAccountActions } from "permissionless/clients";
import { getAccount } from "./getAccount";
import { reusePasskey } from "./reusePasskey";
import { createPasskey } from "./createPasskey";
import { defaultClientConfig } from "../common";
import { createBundlerClient } from "../createBundlerClient";
import { observer } from "@latticexyz/explorer/observer";
import { getPaymasterAddress } from "../getPaymasterAddress";
import { getBundlerTransport } from "../getBundlerTransport";
import { wiresaw } from "@latticexyz/wiresaw/internal";

export type PasskeyConnectorOptions = {
  // TODO: figure out what we wanna do across chains
  chainId: number;
};

export type PasskeyProvider = {
  request: EIP1193RequestFn<EIP1474Methods>;
};

export type PasskeyConnectorProperties = {
  createPasskey(): Promise<void>;
  reusePasskey(): Promise<void>;
  // TODO: does wagmi storage require this to be async?
  hasPasskey(): boolean;
  getClient(parameters?: { chainId?: number | undefined } | undefined): Promise<Client>;
  onConnect(connectInfo: ProviderConnectInfo): void;
};

export type CreatePasskeyConnector = CreateConnectorFn<PasskeyProvider, PasskeyConnectorProperties, {}>;
export type PasskeyConnector = ReturnType<CreatePasskeyConnector>;

passkeyConnector.type = "passkey" as const;

export function passkeyConnector({ chainId }: PasskeyConnectorOptions): CreatePasskeyConnector {
  return createConnector((config) => {
    // TODO: figure out how to use with config's `client` option?
    if (!config.transports) {
      throw new Error(`Wagmi must be configured with transports to use the passkey connector.`);
    }

    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error(`Could not find configured chain for chain ID ${chainId}.`);

    // TODO: wrap transports in wiresaw
    // TODO: adapt wiresaw transport to check chain config and conditionally make its own transport from wiresaw chain config and swap out methods

    const configTransport = config.transports[chain.id];
    if (!configTransport) {
      throw new Error(`Could not find configured transport for chain ID ${chainId}.`);
    }
    const transport = wiresaw(configTransport);

    const paymasterAddress = getPaymasterAddress(chain);
    const bundlerTransport = getBundlerTransport(chain);

    const client = createClient({ ...defaultClientConfig, chain, transport });

    let connected = cache.getState().activeCredential != null;

    return {
      id: "passkey",
      type: passkeyConnector.type,
      name: "Passkey",
      // TODO: check that this works
      // supportsSimulation: true,

      async createPasskey() {
        const { id } = await createPasskey();
        const account = await getAccount(client, id);
        this.onAccountsChanged([account.address]);
        this.onConnect?.({ chainId: numberToHex(chainId) });
      },
      async reusePasskey() {
        const { id } = await reusePasskey();
        const account = await getAccount(client, id);
        this.onAccountsChanged([account.address]);
        this.onConnect?.({ chainId: numberToHex(chainId) });
      },
      hasPasskey() {
        return Object.keys(cache.getState().publicKeys).length > 0;
      },

      async connect(params) {
        console.log("connect");
        // TODO: allow any chain?
        if (params?.chainId != null && params.chainId !== chainId) {
          throw new Error(`Can't connect to chain ${params.chainId}. Passkey connector is bound to chain ${chainId}.`);
        }

        // attempt to reuse credential if this is called directly
        // TODO: move this into wallet so it's only triggered via rainbowkit?
        if (!cache.getState().activeCredential && !params?.isReconnecting) {
          await reusePasskey();
        }

        const accounts = await this.getAccounts();
        connected = accounts.length > 0;

        return { accounts, chainId };
      },
      async disconnect() {
        console.log("disconnect");
        connected = false;
        cache.setState({ activeCredential: null });
      },
      async getAccounts() {
        console.log("getAccounts");
        const id = cache.getState().activeCredential;
        if (!id) return [];

        try {
          console.log("getting account for credential", id);
          const account = await getAccount(client, id);
          console.log("got account", account);
          return [account.address];
        } catch (error) {
          console.log("could not get address for credential ID", id);
        }

        return [];
      },
      async getChainId() {
        return chainId;
      },
      async isAuthorized() {
        console.log("isAuthorized");
        if (!connected) return false;
        const accounts = await this.getAccounts();
        return accounts.length > 0;
      },
      async switchChain(params) {
        // TODO: allow any chain?
        if (params.chainId !== chainId) {
          throw new Error(`Can't connect to chain ${params.chainId}. Passkey connector is bound to chain ${chainId}.`);
        }

        const chain = config.chains.find((c) => c.id === params.chainId);
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());
        return chain;
      },
      onAccountsChanged(accounts) {
        console.log("onAccountsChanged");
        if (accounts.length > 0) {
          config.emitter.emit("change", {
            accounts: accounts.map((a) => getAddress(a)),
          });
        } else {
          this.onDisconnect();
        }
      },
      onChainChanged(chainId) {
        console.log("onChainChanged");
        config.emitter.emit("change", { chainId: Number(chainId) });
      },
      async onConnect(_connectInfo) {
        console.log("onConnect");
        const accounts = await this.getAccounts();
        config.emitter.emit("connect", { accounts, chainId });
      },
      async onDisconnect(_error) {
        console.log("onDisconnect");
        config.emitter.emit("disconnect");
        connected = false;
      },

      // By default, connector clients are bound to a `json-rpc` account.
      // We provide our own `getClient` method here so that we can return
      // a `smart` account, which is necessary for using with Viem's
      // account abstraction actions (i.e. user ops).
      //
      // Although Wagmi recommends connectors be tree-shakable, we return
      // an extended client here so that this client works with native
      // Wagmi hooks. Otherwise the app needs to build its own client, then
      // wrap each call in its own react-query hooks.
      async getClient(params) {
        console.log("passkeyConnector.getClient", params);

        const credentialId = cache.getState().activeCredential;
        if (!credentialId) throw new Error("Not connected.");

        const account = await getAccount(client, credentialId);

        return createBundlerClient({
          paymasterAddress,
          transport: bundlerTransport,
          client,
          account,
        })
          .extend(smartAccountActions())
          .extend(observer());
      },

      async getProvider(_params) {
        // TODO: chain specific provider?
        // TODO: is turning off retryCount important? is wrapping in this way enough to turn off retries?
        return custom({ request: client.transport.request })({ retryCount: 0 });
      },
    };
  });
}
