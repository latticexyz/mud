import { Address } from "viem";
import { store } from "./store";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function getSessionSigner(userAddress: Address) {
  const sessionSignerPrivateKey =
    store.getState().signers[userAddress] ??
    (() => {
      const privateKey = generatePrivateKey();
      store.setState((state) => ({
        signers: {
          ...state.signers,
          [userAddress]: privateKey,
        },
      }));
      return privateKey;
    })();

  return privateKeyToAccount(sessionSignerPrivateKey);
}
