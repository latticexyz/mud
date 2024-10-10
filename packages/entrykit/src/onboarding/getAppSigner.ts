import { Address } from "viem";
import { store } from "./store";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function getAppSigner(userAddress: Address) {
  const appSignerPrivateKey =
    store.getState().appSigners[userAddress] ??
    (() => {
      const privateKey = generatePrivateKey();
      store.setState((state) => ({
        appSigners: {
          ...state.appSigners,
          [userAddress]: privateKey,
        },
      }));
      return privateKey;
    })();

  return privateKeyToAccount(appSignerPrivateKey);
}
