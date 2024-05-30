import { StoreApi, createStore } from "zustand/vanilla";
import { AppAccountClient } from "../common";
import { Account, Chain, Client, Hex, Transport } from "viem";

export type State = {
  accountModalOpen: undefined | boolean;
  openAccountModal: undefined | (() => void);
  closeAccountModal: undefined | (() => void);
  toggleAccountModal: undefined | ((open: boolean) => void);
  /**
   * Viem client bound to the app account (app signer or smart account) and app chain.
   * It is extended with all public and wallet actions and includes some MUD's custom actions for ease of use with account delegation and smart accounts.
   * This will only be set when all Account Kit requirements are met (has signing key, account delegation, gas balance).
   */
  appAccountClient: undefined | AppAccountClient;
  /**
   * Viem connector client.
   * It does not include any actions, so you'll need to use it with standalone/tree-shakable actions actions or extend it yourself.
   *
   * Note that this may be briefly `undefined` when a user switches accounts or chains in their wallet.
   * It's recommended to use `userAddress` or `userChainId` if you need a stable representation of these values.
   *
   * Also note that this client may be connected to a different chain than the app chain.
   * It's recommended that you check `userChainId` before each write call and `switchChain` as necessary.
   */
  userAccountClient: undefined | Client<Transport, Chain, Account>;
  /**
   * Address of the currently connected user.
   */
  userAddress: undefined | Hex;
  /**
   * Chain ID of the currently connected user.
   */
  userChainId: undefined | number;
};

export type Store = StoreApi<State>;

export const store = createStore<State>(() => ({
  accountModalOpen: undefined,
  openAccountModal: undefined,
  closeAccountModal: undefined,
  toggleAccountModal: undefined,
  appAccountClient: undefined,
  userAccountClient: undefined,
  userAddress: undefined,
  userChainId: undefined,
}));
