import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { P256Credential } from "viem/account-abstraction";
import { Address } from "viem";

// TODO: move this to wagmi storage?
//       when I tried, it blew up TS complexity and my IDE was impossible to work with

export type State = {
  readonly publicKeys: {
    readonly [key in P256Credential["id"]]?: P256Credential["publicKey"];
  };
  readonly addresses: {
    readonly [key in P256Credential["id"]]?: Address;
  };
  readonly activeCredential: P256Credential["id"] | null;
};

export const cache = createStore(
  persist<State>(
    () => ({
      publicKeys: {},
      addresses: {},
      activeCredential: null,
    }),
    { name: "mud:passkey:cache" },
  ),
);

// keep cache in sync across tabs/windows via storage event
function listener(event: StorageEvent) {
  if (event.key === cache.persist.getOptions().name) {
    cache.persist.rehydrate();
  }
}
window.addEventListener("storage", listener);
