import { useEffect, useState } from "react";
import { WalletClient, Transport, Chain, Account } from "viem";
import { createSystemCalls } from "../mud/createSystemCalls";
import { SetupNetworkResult } from "../mud/setupNetwork";
import { ClientComponents } from "../mud/createClientComponents";

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
