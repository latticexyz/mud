import { useLocalStorage } from "usehooks-ts";
import { Address, Hex } from "viem";

export type PasskeyAccount = {
  passkeyPublicKey: Hex;
  smartAccountAddress: Address;
};

const localStorageKey = "mud:passkey";

export function usePasskeyAccount(): [PasskeyAccount | undefined, (account: PasskeyAccount) => void, () => void] {
  return useLocalStorage<PasskeyAccount | undefined>(localStorageKey, undefined);
}
