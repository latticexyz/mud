import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { Address, Hex } from "viem";

export type State = {
  readonly signers: {
    readonly [key in Address]?: Hex;
  };
};

export const store = createStore(
  persist<State>(
    () => ({
      signers: {},
    }),
    {
      name: "mud:entrykit",
      partialize: ({ signers }) => ({ signers }),
    },
  ),
);

// keep store in sync across tabs/windows via storage event
function listener(event: StorageEvent) {
  if (event.key === store.persist.getOptions().name) {
    store.persist.rehydrate();
  }
}
window.addEventListener("storage", listener);
