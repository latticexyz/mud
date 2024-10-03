import {
  Address,
  createClient,
  createTransport,
  custom,
  EIP1193Parameters,
  EIP1193RequestFn,
  EIP1474Methods,
  getAddress,
  numberToHex,
  http,
  publicActions,
  SwitchChainError,
  walletActions,
} from "viem";
import { ChainNotConfiguredError, createConnector, CreateConnectorFn } from "wagmi";
import { bundlerActions, P256Credential } from "viem/account-abstraction";
import { getCredentialAddress } from "./getCredentialAddress";
import { cache } from "./cache";
import { createSmartAccountClient, smartAccountActions } from "permissionless/clients";
import { getAccount } from "./getAccount";
import { createPasskey } from "./createPasskey";
import { reusePasskey } from "./reusePasskey";

export type PasskeyConnectorOptions = {
  // TODO: figure out what we wanna do across chains
  chainId: number;
};

export type PasskeyProvider = {
  request: EIP1193RequestFn<EIP1474Methods>;
};
export type PasskeyConnectorProperties = {
  createPasskey(): Promise<Address>;
  reusePasskey(): Promise<Address>;
};
export type PasskeyStorage = {
  // TODO: convert cache to wagmi storage
  passkey: {
    activeCredential?: P256Credential["id"];
  };
};

export type CreatePasskeyConnector = CreateConnectorFn<PasskeyProvider, PasskeyConnectorProperties, PasskeyStorage>;
export type PasskeyConnector = ReturnType<CreatePasskeyConnector>;

passkeyConnector.type = "passkey" as const;

export function passkeyConnector({ chainId }: PasskeyConnectorOptions): CreatePasskeyConnector {
  return createConnector((config) => {
    // TODO: figure out how to use with config's `client` option
    if (!config.transports) {
      throw new Error(`Wagmi must be configured with transports to use the passkey connector.`);
    }

    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error(`Could not find configured chain for chain ID ${chainId}.`);

    const transport = config.transports[chain.id];
    if (!transport) {
      throw new Error(`Could not find configured transport for chain ID ${chainId}.`);
    }
    const client = createClient({ chain, transport, pollingInterval: 1000 });

    let connected = cache.getState().activeCredential != null;

    return {
      id: "passkey",
      type: passkeyConnector.type,
      name: "Passkey",
      // TODO: check that this works
      supportsSimulation: true,

      async createPasskey() {
        const address = await createPasskey(client);
        this.onAccountsChanged([address]);
        this.onConnect({ chainId: numberToHex(chainId) });
        return address;
      },
      async reusePasskey() {
        const address = await reusePasskey(client);
        this.onAccountsChanged([address]);
        this.onConnect({ chainId: numberToHex(chainId) });
        return address;
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
      },
      async getAccounts() {
        console.log("getAccounts");
        const id = cache.getState().activeCredential;
        if (!id) return [];

        try {
          console.log("looking up address for credential", id);
          const address = await getCredentialAddress(client, id);
          console.log("got credential address", address);
          return [address];
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
      async onConnect(connectInfo) {
        console.log("onConnect");
        const accounts = await this.getAccounts();
        const chainId = Number(connectInfo.chainId);
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
      async getClient(params) {
        console.log("passkeyConnector.getClient", params);
        // TODO: support params.chainId?

        const account = await getAccount(client);

        return createSmartAccountClient({
          // TODO: lift this into config
          bundlerTransport: http("http://127.0.0.1:4337"),
          client,
          account,
          pollingInterval: 1000,
        });
      },

      async getProvider(params) {
        console.log("passkeyConnector.getProvider", params);

        // This feels like a weird dependency loop
        const account = await getAccount(client);
        // TODO: should this still return a provider but without the account-specific methods implemented?
        console.log("got account for provider", account);
        // if (!account) throw new Error("not connected");
        if (!account) return createTransport(client.transport);

        // const bundlerClient = createClient({
        //   chain,
        //   transport: http("https://bundler.tunnel.offchain.dev"),
        //   pollingInterval: 500,
        // });

        // const connectorClient = createClient({
        //   account,
        //   chain,
        //   transport: () => createTransport(client.transport),
        // });

        // const smartAccountClient = connectorClient
        //   .extend(publicActions)
        //   .extend(walletActions) // TODO: bind account to client somehow
        //   .extend(() => bundlerActions(bundlerClient))
        //   .extend(smartAccountActions());

        const request = async (req: EIP1193Parameters<EIP1474Methods>) => {
          // switch (req.method) {
          //   case "personal_sign": {
          //     const [message, _address] = req.params;
          //     return await account.signMessage({ message });
          //   }
          //   case "eth_signTypedData_v4": {
          //     const [_address, data] = req.params;
          //     return await account.signTypedData(JSON.parse(data));
          //   }
          //   // case "eth_sendTransaction": {
          //   //   console.log("eth_sendTransaction", req.params);
          //   //   const actualParams = req.params[0];
          //   //   const hash = await smartAccountClient.sendTransaction({
          //   //     account,
          //   //     data: actualParams?.data,
          //   //     to: actualParams?.to,
          //   //     value: actualParams?.value ? hexToBigInt(actualParams.value) : undefined,
          //   //     gas: actualParams?.gas ? hexToBigInt(actualParams.gas) : undefined,
          //   //     // nonce: actualParams?.nonce
          //   //     //   ? hexToNumber(actualParams.nonce)
          //   //     //   : undefined,
          //   //     maxPriorityFeePerGas: actualParams?.maxPriorityFeePerGas
          //   //       ? hexToBigInt(actualParams.maxPriorityFeePerGas)
          //   //       : undefined,
          //   //     maxFeePerGas: actualParams?.maxFeePerGas ? hexToBigInt(actualParams.maxFeePerGas) : undefined,
          //   //     gasPrice: (actualParams?.gasPrice ? hexToBigInt(actualParams.gasPrice) : undefined) as undefined,
          //   //   });
          //   //   return hash;
          //   // }
          // }
          console.log("requested", req.method, req.params);
          return client.transport.request(req);
        };

        return custom({ request })({ retryCount: 0 });
      },
    };
  });
}
