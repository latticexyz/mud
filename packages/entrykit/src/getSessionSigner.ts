import { Address, isHex } from "viem";
import { store } from "./store";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function getSessionSigner(userAddress: Address) {
  const label = userAddress.toLowerCase() as Address;
  const sessionSignerPrivateKey =
    store.getState().signers[label] ??
    (() => {
      // attempt to reuse previous AccountKit session
      const deprecatedPrivateKey = localStorage.getItem(`mud:appSigner:privateKey:${userAddress.toLowerCase()}`);
      const privateKey = isHex(deprecatedPrivateKey) ? deprecatedPrivateKey : generatePrivateKey();
      store.setState((state) => ({
        signers: {
          ...state.signers,
          [label]: privateKey,
        },
      }));
      return privateKey;
    })();

  return privateKeyToAccount(sessionSignerPrivateKey);
}
