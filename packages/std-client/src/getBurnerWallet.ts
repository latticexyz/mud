import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { isHex, Hex } from "viem";
import { BehaviorSubject } from "rxjs";

export function getBurnerWallet(cacheKey = "mud:burnerWallet"): BehaviorSubject<Hex> {
  const cachedPrivateKey = localStorage.getItem(cacheKey);
  const subject = isHex(cachedPrivateKey)
    ? new BehaviorSubject(cachedPrivateKey)
    : (() => {
        const privateKey = generatePrivateKey();
        console.log("New burner wallet created:", privateKeyToAccount(privateKey));
        localStorage.setItem(cacheKey, privateKey);
        return new BehaviorSubject(privateKey);
      })();

  window.addEventListener("storage", function listener(event) {
    // Clean up
    if (subject.closed) {
      window.removeEventListener("storage", listener);
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
    if (!isHex(event.newValue)) {
      console.warn("Invalid burner wallet added to cache! You may need to reload to create a new wallet.");
      return;
    }

    subject.next(event.newValue);
  });

  return subject;
}
