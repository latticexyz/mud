// fix for store type not resolving
import "zustand/middleware";
import { Storage } from "porto";
import { Porto } from "porto/remote";
import { mode } from "./mode";
import { garnet, pyrope, redstone } from "@latticexyz/common/chains";
import { anvil } from "viem/chains";

export const porto = Porto.create({
  mode: mode(),
  storage: Storage.localStorage(),
  chains: [
    {
      ...redstone,
      rpcUrls: {
        ...redstone.rpcUrls,
        bundler: {
          http: ["https://rpc.redstonechain.com"],
          webSocket: ["wss://rpc.redstonechain.com"],
        },
      },
      contracts: {
        ...redstone.contracts,
        quarryPaymaster: {
          address: "0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f",
        },
      },
    },
    garnet,
    pyrope,
    {
      ...anvil,
      rpcUrls: {
        ...anvil.rpcUrls,
        default: {
          http: ["https://anvil.tunnel.offchain.dev"],
          webSocket: ["wss://anvil.tunnel.offchain.dev"],
        },
      },
      contracts: {
        ...anvil.contracts,
        quarryPaymaster: {
          address: "0x6439113f0e1f64018c3167DA2aC21e2689818086",
        },
      },
    },
  ],
});
