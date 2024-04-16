import { StoreApi, createStore } from "zustand/vanilla";
import { AppAccountClient } from "../common";

export type State = {
  accountModalOpen: undefined | boolean;
  openAccountModal: undefined | (() => void);
  closeAccountModal: undefined | (() => void);
  toggleAccountModal: undefined | ((open: boolean) => void);
  // TODO: downcast this to a plain wallet client to support non-smart account use cases later
  appAccountClient: AppAccountClient | undefined;
};

export type Store = StoreApi<State>;

export const store = createStore<State>(() => ({
  accountModalOpen: undefined,
  openAccountModal: undefined,
  closeAccountModal: undefined,
  toggleAccountModal: undefined,
  appAccountClient: undefined,
}));
