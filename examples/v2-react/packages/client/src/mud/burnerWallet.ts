import { Wallet } from "ethers";
import { BehaviorSubject } from "rxjs";

// TODO: move to MUD util?

export function burnerWallet(
  cacheKey = "mud:burnerWallet"
): BehaviorSubject<string> {
  const cachedPrivateKey = localStorage.getItem(cacheKey);
  const subject = cachedPrivateKey
    ? new BehaviorSubject(cachedPrivateKey)
    : (() => {
        // TODO: move to viem wallet
        const wallet = Wallet.createRandom();
        console.log("New burner wallet created:", wallet.address);
        localStorage.setItem(cacheKey, wallet.privateKey);
        return new BehaviorSubject(wallet.privateKey);
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
      console.warn(
        "Burner wallet removed from cache! You may need to reload to create a new wallet."
      );
      return;
    }

    subject.next(event.newValue);
  });

  return subject;
}
