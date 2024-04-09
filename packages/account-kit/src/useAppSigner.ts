import { PrivateKeyAccount, Hex } from "viem";
import { useLocalStorage } from "usehooks-ts";
import { privateKeyToAccount } from "viem/accounts";
import { useMemo } from "react";

export const storageKey = "mud:appSigner:privateKey";

export function useAppSigner(): [PrivateKeyAccount | undefined, (privateKey: Hex) => void] {
  const [privateKey, setPrivateKey] = useLocalStorage<Hex | undefined>(storageKey, undefined);
  return useMemo(
    () => [privateKey ? privateKeyToAccount(privateKey) : undefined, setPrivateKey],
    [privateKey, setPrivateKey],
  );
}
