import { Address } from "viem";
import { store } from "./store";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function getSessionSigner(userAddress: Address) {
  const sessionSignerPrivateKey =
    store.getState().signers[userAddress] ??
    (() => {
      // TODO: localStorage.get gets stuck??
      // const privateKey =
      //   // attempt to reuse previous AccountKit session
      //   localStorage.get(`mud:appSigner:privateKey:${userAddress.toLowerCase()}`) ??
      //   // otherwise create a fresh one
      //   generatePrivateKey();

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
