import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { isHex, Hex } from "viem";
import { BehaviorSubject } from "rxjs";

const localStorage = typeof window === "undefined" ? undefined : window.localStorage;
const addEventListener = typeof window === "undefined" ? undefined : window.addEventListener;
const removeEventListener = typeof window === "undefined" ? undefined : window.removeEventListener;

function assertPrivateKey(privateKey: string, cacheKey: string): asserts privateKey is Hex {
  if (!isHex(privateKey)) {
    console.error("Private key found in cache is not valid hex", { privateKey, cacheKey });
    throw new Error(`Private key found in cache (${cacheKey}) is not valid hex`);
  }
  // ensure we can extract address from private key
  // this should throw on bad private keys
  privateKeyToAccount(privateKey);
}

export function getBurnerWallet(cacheKey = "mud:burnerWallet"): BehaviorSubject<Hex> {
  const cachedPrivateKey = localStorage?.getItem(cacheKey);

  if (cachedPrivateKey != null) {
    assertPrivateKey(cachedPrivateKey, cacheKey);
  }

  const subject =
    cachedPrivateKey != null
      ? new BehaviorSubject(cachedPrivateKey)
      : (() => {
          const privateKey = generatePrivateKey();
          console.log("New burner wallet created:", privateKeyToAccount(privateKey));
          localStorage?.setItem(cacheKey, privateKey);
          return new BehaviorSubject(privateKey);
        })();

  addEventListener?.("storage", function listener(event) {
    // Clean up
    if (subject.closed) {
      removeEventListener?.("storage", listener);
      return;
    }

    if (event.key !== cacheKey) return;
    if (event.storageArea !== localStorage) return;

    if (!event.newValue) {
      // We'll intentionally not create a new burner wallet here to avoid potential infinite
      // loop issues, and just warn the user. A refresh will go through the logic above to
      // create a new burner wallet.
      console.warn("Burner wallet removed from cache! You may need to reload to create a new wallet.");
      return;
    }

    assertPrivateKey(event.newValue, cacheKey);
    subject.next(event.newValue);
  });

  return subject;
}
