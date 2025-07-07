import { EIP1193RequestFn, EIP1474Methods, Account, http } from "viem";
import { createConnector, CreateConnectorFn } from "wagmi";
import { debug } from "./debug";
import { connectMessagePort } from "./sync/connectMessagePort";

export type PasskeyConnectorOptions = {
  // TODO: figure out what we wanna do across chains
  chainId: number;
  rpId?: string;
};

export type PasskeyProvider = {
  request: EIP1193RequestFn<EIP1474Methods>;
};

export type PasskeyConnectorProperties = {};

export type CreatePasskeyConnector = CreateConnectorFn<PasskeyProvider, PasskeyConnectorProperties, {}>;
export type PasskeyConnector = ReturnType<CreatePasskeyConnector>;

mudId.type = "passkey" as const;

export function mudId({ chainId, rpId = "id.smartpass.dev" }: PasskeyConnectorOptions): CreatePasskeyConnector {
  return createConnector((config) => {
    debug("connector created");

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

    let connected = false;
    const accounts: Account[] = [];

    return {
      id: "mud-id",
      type: mudId.type,
      name: "MUD ID",
      icon: `data:image/svg+xml;base64,${btoa(icon)}`,
      // TODO: check that this works
      // supportsSimulation: true,

      async connect() {
        console.log("connect called");
        connected = true;
        return {
          accounts: accounts.map((a) => a.address),
          chainId: chain.id,
        };
      },
      async disconnect() {
        connected = false;
      },
      async getAccounts() {
        return accounts.map((a) => a.address);
      },
      async getChainId() {
        return chain.id;
      },
      async getProvider() {
        return http()({ chain });
      },
      async isAuthorized() {
        if (!connected) return false;

        const accounts = await this.getAccounts();
        return !!accounts.length;
      },
      async onAccountsChanged() {},
      async onDisconnect() {},
      onChainChanged() {},
    };
  });
}

export function isMudId(connector: ReturnType<CreateConnectorFn> | undefined): connector is PasskeyConnector {
  return connector?.type === mudId.type;
}

/* eslint-disable max-len */
const icon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" shape-rendering="crispEdges">
    <rect width="100%" height="100%" fill="#FF7612" />
    <svg x="3" y="3" width="8" height="8" viewBox="0 0 8 8" fill="#FFF" shape-rendering="crispEdges">
      <path d="M0 0h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm1 0h1v1H1zm1 0h1v1H2zm1 0h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm2-1h1v1H7zm0 1h1v1H7zM6 7h1v1H6zm1-2h1v1H7zm0-1h1v1H7zm0-1h1v1H7z" />
      <path opacity=".5" d="M2 2h1v1H2zm0 1h1v1H2zm0 1h1v1H2zm0 1h1v1H2zm1-3h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm0 1h1v1H5zm0 1h1v1H5zm0 1h1v1H5zM4 5h1v1H4zM3 5h1v1H3z" />
      <path d="M7 2h1v1H7zm0-1h1v1H7zM1 0h1v1H1zm1 0h1v1H2zm1 0h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm1 0h1v1H6zm1 0h1v1H7z" />
    </svg>
  </svg>
`;
/* eslint-enable max-len */
