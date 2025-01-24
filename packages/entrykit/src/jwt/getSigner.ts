import { cache } from "./cache";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function getSigner() {
  const sessionSignerPrivateKey =
    cache.getState().signer ??
    (() => {
      const privateKey = generatePrivateKey();
      cache.setState(() => ({
        signer: privateKey,
      }));
      return privateKey;
    })();

  return privateKeyToAccount(sessionSignerPrivateKey);
}
