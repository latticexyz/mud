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
  LocalAccount,
} from "viem";
import { ChainNotConfiguredError, createConnector, CreateConnectorFn } from "wagmi";
import { cache } from "./cache";
import { smartAccountActions } from "permissionless/clients";
import { getAccount } from "./getAccount";
import { generateProof } from "./generateProof";
import { defaultClientConfig } from "../common";
import { createBundlerClient } from "../createBundlerClient";
import { getBundlerTransport } from "../getBundlerTransport";
import { getSigner } from "./getSigner";

export type JwtConnectorOptions = {
  // TODO: figure out what we wanna do across chains
  chainId: number;
};

export type JwtProvider = {
  request: EIP1193RequestFn<EIP1474Methods>;
};

export type JwtConnectorProperties = {
  generateJwtProof(jwt: string): Promise<void>;
  getSigner(): LocalAccount;
  getClient(parameters?: { chainId?: number | undefined } | undefined): Promise<Client>;
  onConnect(connectInfo: ProviderConnectInfo): void;
};

export type CreateJwtConnector = CreateConnectorFn<JwtProvider, JwtConnectorProperties, {}>;
export type JwtConnector = ReturnType<CreateJwtConnector>;

jwtConnector.type = "jwt" as const;

export function jwtConnector({ chainId }: JwtConnectorOptions): CreateJwtConnector {
  return createConnector((config) => {
    if (!config.transports) {
      throw new Error(`Wagmi must be configured with transports to use the jwt connector.`);
    }

    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error(`Could not find configured chain for chain ID ${chainId}.`);

    const transport = config.transports[chain.id];
    if (!transport) {
      throw new Error(`Could not find configured transport for chain ID ${chainId}.`);
    }
    const bundlerTransport = getBundlerTransport(chain);

    const client = createClient({ ...defaultClientConfig, chain, transport: transport });

    let connected = cache.getState().jwtProof != null;

    return {
      id: "jwt",
      type: jwtConnector.type,
      name: "jwt",
      // TODO: check that this works
      // supportsSimulation: true,

      async generateJwtProof(jwt: string) {
        const jwtProof = await generateProof(jwt);
        cache.setState({ jwtProof });

        console.log({ jwtProof });
        const account = await getAccount(client, jwtProof);
        this.onAccountsChanged([account.address]);
        this.onConnect?.({ chainId: numberToHex(chainId) });
      },
      getSigner() {
        return getSigner();
      },
      async connect(params) {
        console.log("connect");
        // TODO: allow any chain?
        if (params?.chainId != null && params.chainId !== chainId) {
          throw new Error(`Can't connect to chain ${params.chainId}. Passkey connector is bound to chain ${chainId}.`);
        }

        const accounts = await this.getAccounts();
        connected = accounts.length > 0;

        return { accounts, chainId };
      },
      async disconnect() {
        console.log("disconnect");
        connected = false;
        cache.setState({ jwtProof: null });
      },
      async getAccounts() {
        console.log("getAccounts");
        const jwtProof = cache.getState().jwtProof;
        if (!jwtProof) return [];

        try {
          console.log("getting account for accountSalt", jwtProof.accountSalt);
          const account = await getAccount(client, jwtProof);
          console.log("got account", account);
          return [account.address];
        } catch (error) {
          console.log("could not get address for accountSalt", jwtProof.accountSalt);
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
          throw new Error(`Can't connect to chain ${params.chainId}. Jwt connector is bound to chain ${chainId}.`);
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
        console.log("jwtConnector.getClient", params);

        const jwtProof = cache.getState().jwtProof;
        if (!jwtProof) throw new Error("Not connected.");

        const account = await getAccount(client, jwtProof);

        return createBundlerClient({
          transport: bundlerTransport,
          client,
          account,
        }).extend(smartAccountActions);
        // TODO: add observer once we conditionally fetch receipts while bridge is open
      },

      async getProvider(_params) {
        // TODO: chain specific provider?
        // TODO: is turning off retryCount important? is wrapping in this way enough to turn off retries?
        return custom({ request: client.transport.request })({ retryCount: 0 });
      },
    };
  });
}
