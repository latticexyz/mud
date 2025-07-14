import { Storage } from "porto";
import { Porto } from "porto/remote";
import { mode } from "./mode";

// fix for store type not resolving
import "zustand/middleware";

export const porto = Porto.create({
  mode: mode(),
  storage: Storage.combine(Storage.cookie(), Storage.localStorage()),
});

porto._internal.store.subscribe((state) => {
  console.log("state changed", state);
});

porto.messenger.on("rpc-requests", (requests) => {
  console.log("porto.messenger rcp-requests", requests);
});
porto.messenger.on("__internal", () => {
  console.log("porto.messenger __internal");
});
