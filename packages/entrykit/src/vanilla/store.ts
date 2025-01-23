import { StoreApi, createStore } from "zustand/vanilla";
import { SessionClient } from "../common";

export type State = {
  accountModalOpen: undefined | boolean;
  openAccountModal: undefined | (() => void);
  closeAccountModal: undefined | (() => void);
  toggleAccountModal: undefined | ((open: boolean) => void);
  /**
   * Viem client bound to the session smart account on the world's chain.
   * It is extended with all public and wallet actions and includes some MUD's custom actions for ease of use with account delegation and smart accounts.
   * This will only be set when all EntryKit requirements are met.
   */
  sessionClient: undefined | SessionClient;
};

export type Store = StoreApi<State>;

export const store = createStore<State>(() => ({
  accountModalOpen: undefined,
  openAccountModal: undefined,
  closeAccountModal: undefined,
  toggleAccountModal: undefined,
  sessionClient: undefined,
}));
