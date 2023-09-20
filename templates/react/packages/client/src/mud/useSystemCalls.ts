import { useEffect, useState } from "react";
import { WalletClient, Transport, Chain, Account } from "viem";
import { createSystemCalls } from "./createSystemCalls";
import { SetupNetworkResult } from "./setupNetwork";
import { ClientComponents } from "./createClientComponents";

export function useSystemCalls(
  network: SetupNetworkResult,
  components: ClientComponents,
  client: WalletClient<Transport, Chain, Account> | null | undefined
) {
  // TODO type systemCalls
  const [systemCalls, setSystemCalls] = useState<ReturnType<typeof createSystemCalls> | undefined>(undefined);

  useEffect(() => {
    if (!client) return;

    const systemCalls = createSystemCalls(network, components, client);
    setSystemCalls(systemCalls);

    // TODO what's the cleanup fn?
  }, [client]);

  return systemCalls;
}
