import { type Connector, createConnector, CreateConnectorFn } from "wagmi";
import { Address, ExactPartial, ProviderConnectInfo } from "viem";
import { Chains, Porto, RpcSchema } from "porto";
import { porto } from "porto/wagmi";
import { rp } from "../common";
import { mode } from "../mode";

// TODO: import from porto
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
};

export type IdPlaceConnector = Connector<CreateConnectorFn<Provider, Properties>>;

export function idPlace<const chains extends readonly [Chains.Chain, ...Chains.Chain[]]>(
  config: ExactPartial<Porto.Config<chains>> = {},
): CreateConnectorFn<Provider, Properties> {
  const createPortoConnector = porto({
    ...config,
    mode: config.mode ?? mode(),
  });

  return createConnector<Provider, Properties>((wagmiConfig) => {
    return {
      ...createPortoConnector(wagmiConfig),
      id: rp.id,
      name: rp.name,
      icon: `data:image/svg+xml;base64,${btoa(icon)}`,
    };
  });
}

export function isIdPlaceConnector(connector: Connector): connector is IdPlaceConnector {
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
