import { Chain, fallback, http, webSocket } from "viem";
import { anvil } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";
import {
  redstone,
  abstract,
  ancient8,
  apeChain,
  arbitrum,
  arbitrumNova,
  avalanche,
  base,
  berachain,
  bob,
  boba,
  celo,
  cronos,
  flowMainnet,
  gravity,
  holesky,
  ink,
  linea,
  lisk,
  mainnet,
  manta,
  mantle,
  metis,
  mint,
  optimism,
  polygon,
  sanko,
  scroll,
  sei,
  shape,
  soneium,
  swellchain,
  taiko,
  unichain,
  worldchain,
  zircuit,
  zksync,
  zora,
} from "viem/chains";

const relayChains = [
  abstract,
  ancient8,
  apeChain,
  arbitrum,
  arbitrumNova,
  avalanche,
  base,
  berachain,
  bob,
  boba,
  celo,
  cronos,
  flowMainnet,
  gravity,
  holesky,
  ink,
  linea,
  lisk,
  mainnet,
  manta,
  mantle,
  metis,
  mint,
  optimism,
  polygon,
  sanko,
  scroll,
  sei,
  shape,
  soneium,
  swellchain,
  taiko,
  unichain,
  worldchain,
  zircuit,
  zksync,
  zora,
] as const;

const redstoneWithPaymaster = {
  ...redstone,
  rpcUrls: {
    ...redstone.rpcUrls,
    bundler: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"],
    },
    wiresaw: {
      http: ["https://wiresaw.redstonechain.com"],
      webSocket: ["wss://wiresaw.redstonechain.com"],
    },
  },
  contracts: {
    ...redstone.contracts,
    quarryPaymaster: {
      address: "0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f",
    },
  },
};

const chains = [
  redstoneWithPaymaster,

  mainnet,
  {
    ...anvil,
    rpcUrls: {
      // ...anvil.rpcUrls,
      default: {
        http: ["https://anvil.tunnel.offchain.dev"],
        webSocket: ["wss://anvil.tunnel.offchain.dev"],
      },
      // bundler: {
      //   http: ["http://127.0.0.1:4337"],
      // },
      // TODO: automatically grant allowance in anvil instead of requiring the service
      // quarryPassIssuer: {
      //   http: ["http://127.0.0.1:3003/rpc"],
      // },
    },
    contracts: {
      // quarryPaymaster: {
      //   address: "0x8D8b6b8414E1e3DcfD4168561b9be6bD3bF6eC4B",
      // },
      paymaster: {
        address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
      },
    },
  },
  ...relayChains,

  // {
  //   ...redstone,
  //   rpcUrls: {
  //     ...redstone.rpcUrls,
  //     bundler: {
  //       http: ["https://redstone.tunnel.offchain.dev/rpc"],
  //     },
  //   },
  //   contracts: {
  //     ...redstone.contracts,
  //     quarryPaymaster: {
  //       address: "0x0528104d96672dfdF47B92f809A32e7eA11Ee8d9",
  //     },
  //   },
  // },
] as const satisfies Chain[];

const websocketConfig: WebSocketTransportConfig = {
  keepAlive: { interval: 1000 },
  reconnect: true,
  retryCount: 3,
};
const httpConfig: HttpTransportConfig = {
  batch: {
    batchSize: 100,
    wait: 1000,
  },
};

const defaultTransport = fallback([webSocket(undefined, websocketConfig), http(undefined, httpConfig)]);
const transports = {
  [mainnet.id]: defaultTransport,
  [anvil.id]: defaultTransport,
  [redstone.id]: defaultTransport,
  ...Object.fromEntries(relayChains.map((chain) => [chain.id, http()])),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "3f1000f6d9e0139778ab719fddba894a",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 500,
    [redstone.id]: 500,
    ...Object.fromEntries(relayChains.map((chain) => [chain.id, 500])),
  },
});
