import { Hex, isHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function assertPrivateKey(privateKey: string, cacheKey: string): asserts privateKey is Hex {
  if (!isHex(privateKey)) {
    console.error("Private key found in cache is not valid hex", { privateKey, cacheKey });
    throw new Error(`Private key found in cache (${cacheKey}) is not valid hex`);
  }
  // ensure we can extract address from private key
  // this should throw on bad private keys
  privateKeyToAccount(privateKey);
}

export const DEFAULT_BURNER_CACHE_KEY = "mud:burnerWallet";

export function getBurnerPrivateKey(cacheKey = DEFAULT_BURNER_CACHE_KEY): Hex {
  const cachedPrivateKey = localStorage.getItem(cacheKey);

  if (cachedPrivateKey != null) {
    assertPrivateKey(cachedPrivateKey, cacheKey);
    return cachedPrivateKey;
  }

  const privateKey = generatePrivateKey();
  console.log("New burner wallet created:", privateKeyToAccount(privateKey));
  localStorage.setItem(cacheKey, privateKey);
  return privateKey;
}
