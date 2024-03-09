import { useMemo } from "react";
import type { WalletClient, Transport, Chain, Account } from "viem";
import { useNetwork } from "../NetworkContext";
import { isDelegated, setupDelegation } from "./delegation";
import { getBurnerAccount } from "./getBurnerAccount";

// A React hook that checks delegation and provides a delegation function.
export function useDelegation(externalWalletClient: WalletClient<Transport, Chain, Account>) {
  const network = useNetwork();

  // Memoize the result to minimize local storage access.
  const burnerAddress = useMemo(() => getBurnerAccount().address, []);

  const delegation = network.useStore((state) =>
    state.getValue(network.tables.UserDelegationControl, {
      delegator: externalWalletClient.account.address,
      delegatee: burnerAddress,
    }),
  );

  if (isDelegated(delegation)) return { status: "delegated" as const };

  return {
    status: "unset" as const,
    setupDelegation: () => setupDelegation(network, externalWalletClient, burnerAddress),
  };
}
