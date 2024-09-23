import { PrivateKeyAccount, Hex } from "viem";
import { useLocalStorage } from "usehooks-ts";
import { privateKeyToAccount } from "viem/accounts";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export function useAppSigner(): [PrivateKeyAccount | undefined, (privateKey: Hex) => void] {
  const { address } = useAccount();
  const storageKey = `mud:appSigner:privateKey:${address?.toLowerCase() ?? ""}`;

  const [privateKey, setPrivateKey] = useLocalStorage<Hex | undefined>(storageKey, undefined);
  return useMemo(
    () => [privateKey ? privateKeyToAccount(privateKey) : undefined, address ? setPrivateKey : () => {}],
    [address, privateKey, setPrivateKey],
  );
}
