// fix for store type not resolving
import "zustand/middleware";
import { Storage } from "porto";
import { Porto } from "porto/remote";
import { mode } from "./mode";

import { anvil } from "viem/chains";

export const porto = Porto.create({
  mode: mode(),
  storage: Storage.localStorage(),
  chains: [
    // TODO: add more supported chains
    {
      ...anvil,
      rpcUrls: {
        ...anvil.rpcUrls,
        default: {
          http: ["https://anvil.tunnel.offchain.dev"],
          webSocket: ["wss://anvil.tunnel.offchain.dev"],
        },
      },
    },
  ],
});

porto._internal.store.subscribe((state) => {
  console.log("state changed", state);
});

porto.messenger.on("rpc-requests", (requests) => {
  console.log("porto.messenger rpc-requests", requests);
});
porto.messenger.on("__internal", () => {
  console.log("porto.messenger __internal");
});
