import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { Hex } from "viem";

export type State = {
  readonly jwtProof: any | null;
  readonly signer: Hex | null;
};

export const cache = createStore(
  persist<State>(
    () => ({
      jwtProof: null,
      signer: null,
    }),
    { name: "mud:jwt:cache" },
  ),
);

// keep cache in sync across tabs/windows via storage event
function listener(event: StorageEvent) {
  if (event.key === cache.persist.getOptions().name) {
    cache.persist.rehydrate();
  }
}
window.addEventListener("storage", listener);
