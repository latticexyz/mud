import {
  Address,
  bytesToHex,
  Client,
  createClient,
  createTransport,
  custom,
  EIP1193Parameters,
  EIP1474Methods,
  getAddress,
  hashMessage,
  hexToBigInt,
  http,
  publicActions,
  SwitchChainError,
  walletActions,
} from "viem";
import { ChainNotConfiguredError, createConnector } from "wagmi";
import { bundlerActions, toCoinbaseSmartAccount, toWebAuthnAccount } from "viem/account-abstraction";
import { createCredential, sign } from "webauthn-p256";
import { getCredentialAddress } from "./getCredentialAddress";
import { cache } from "./cache";
import { smartAccountActions } from "permissionless/clients";
import { getMessageHash } from "./getMessageHash";
import { recoverPublicKey } from "./recoverPublicKey";

async function getAccount(client: Client) {
  const id = cache.getState().activeCredential;
  if (!id) return;

  const { publicKeys, addresses } = cache.getState();

  const publicKey = publicKeys[id];
  if (!publicKey) return;

  // TODO: replace this with our own thing
  return await toCoinbaseSmartAccount({
    address: addresses[id],
    client,
    owners: [toWebAuthnAccount({ credential: { id, publicKey } })],
  });
}

export type PasskeyConnectorOptions = {
  chainId: number;
};

passkeyConnector.type = "passkey" as const;
export function passkeyConnector({ chainId }: PasskeyConnectorOptions) {
  type Provider = unknown; // TODO
  type Properties = {
    createPasskey(): Promise<Address>;
    reusePasskey(): Promise<Address>;
  };
  // TODO: StorageItem type? use instead zustand store?

  return createConnector<Provider, Properties>((config) => {
    if (!config.transports) {
      throw new Error(`Wagmi must be configured with transports to use the passkey connector.`);
    }

    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) throw new Error(`Could not find configured chain for chain ID ${chainId}.`);
    const transport = config.transports?.[chain.id];
    if (!transport) {
      throw new Error(`Could not find configured transport for chain ID ${chainId}.`);
    }
    const client = createClient({ chain, transport });

    return {
      id: "passkey",
      type: passkeyConnector.type,
      name: "Passkey",

      async createPasskey() {
        const credential = await createCredential({ name: "MUD Account" });
        console.log("created passkey", credential);

        cache.setState((state) => ({
          activeCredential: credential.id,
          publicKeys: {
            ...state.publicKeys,
            [credential.id]: credential.publicKey,
          },
        }));

        const address = await getCredentialAddress(client, credential.id);
        return address;
      },

      async reusePasskey() {
        const randomChallenge = bytesToHex(crypto.getRandomValues(new Uint8Array(256)));

        const messageHash = hashMessage(randomChallenge);
        const { signature, webauthn, raw: credential } = await sign({ hash: messageHash });
        // TODO: look up account/public key by credential ID once we store it onchain

        const webauthnHash = await getMessageHash(webauthn);

        const passkey = await recoverPublicKey({
          credentialId: credential.id,
          messageHash: webauthnHash,
          signatureHex: signature,
        });
        if (!passkey) {
          throw new Error("recovery failed");
        }

        console.log("recovered passkey", passkey);

        cache.setState((state) => ({
          activeCredential: passkey.credential.id,
          publicKeys: {
            ...state.publicKeys,
            [passkey.credential.id]: passkey.publicKey,
          },
        }));

        const address = await getCredentialAddress(client, passkey.credential.id);
        return address;
      },

      async connect(params) {
        console.log("connect");
        // TODO: allow any chain?
        if (params && params.chainId !== chainId) {
          throw new Error(`Can't connect to chain ${params.chainId}. Passkey connector is bound to chain ${chainId}.`);
        }

        // const accounts = await this.getAccounts();
        // if (accounts.length) return { accounts, chainId };

        // const credential = await createCredential({ name: "MUD Account" });
        // console.log("created passkey", credential);

        // cache.setState((state) => ({
        //   activeCredential: credential.id,
        //   publicKeys: {
        //     ...state.publicKeys,
        //     [credential.id]: credential.publicKey,
        //   },
        // }));

        return {
          accounts: await this.getAccounts(),
          chainId,
        };
      },
      async disconnect() {
        console.log("disconnect");
        config.emitter.emit("disconnect");
      },
      async getAccounts() {
        console.log("getAccounts");
        const id = cache.getState().activeCredential;
        if (!id) return [];

        try {
          const address = await getCredentialAddress(client, id);
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
        // const accounts = await this.getAccounts();
        // return accounts.length > 0;
        return true;
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
        config.emitter.emit("change", {
          accounts: accounts.map((a) => getAddress(a)),
        });
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
      },

      async getProvider(params) {
        console.log("asked for provider", params);

        // This feels like a weird dependency loop
        const account = await getAccount(client);
        // TODO: should this still return a provider but without the account-specific methods implemented?
        console.log("got account for provider", account);
        // if (!account) throw new Error("not connected");
        if (!account) return createTransport(client.transport);

        const bundlerClient = createClient({
          chain,
          transport: http("https://bundler.tunnel.offchain.dev"),
          pollingInterval: 500,
        });

        const connectorClient = createClient({
          account,
          chain,
          transport: () => createTransport(client.transport),
        });

        const smartAccountClient = connectorClient
          .extend(publicActions)
          .extend(walletActions) // TODO: bind account to client somehow
          .extend(() => bundlerActions(bundlerClient))
          .extend(smartAccountActions());

        const request = async (req: EIP1193Parameters<EIP1474Methods>) => {
          switch (req.method) {
            case "personal_sign": {
              const [message, _address] = req.params;
              return await account.signMessage({ message });
            }
            case "eth_signTypedData_v4": {
              const [_address, data] = req.params;
              return await account.signTypedData(JSON.parse(data));
            }
            case "eth_sendTransaction": {
              console.log("eth_sendTransaction", req.params);
              const actualParams = req.params[0];
              const hash = await smartAccountClient.sendTransaction({
                account,
                data: actualParams?.data,
                to: actualParams?.to,
                value: actualParams?.value ? hexToBigInt(actualParams.value) : undefined,
                gas: actualParams?.gas ? hexToBigInt(actualParams.gas) : undefined,
                // nonce: actualParams?.nonce
                //   ? hexToNumber(actualParams.nonce)
                //   : undefined,
                maxPriorityFeePerGas: actualParams?.maxPriorityFeePerGas
                  ? hexToBigInt(actualParams.maxPriorityFeePerGas)
                  : undefined,
                maxFeePerGas: actualParams?.maxFeePerGas ? hexToBigInt(actualParams.maxFeePerGas) : undefined,
                gasPrice: (actualParams?.gasPrice ? hexToBigInt(actualParams.gasPrice) : undefined) as undefined,
              });
              return hash;
            }
          }
          console.log("requested", req.method, req.params);
          return client.transport.request(req);
        };

        return custom({ request })({ retryCount: 0 });
      },
    };
  });
}
