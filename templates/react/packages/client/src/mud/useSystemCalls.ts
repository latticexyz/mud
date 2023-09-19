import { Schema } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { WalletClient, Transport, Chain, Account } from "viem";
import { createSystemCalls } from "./createSystemCalls";
import { SetupNetworkResult } from "./setupNetwork";
import { ClientComponents } from "./createClientComponents";

export function useSystemCalls<S extends Schema>(
  network: SetupNetworkResult,
  components: ClientComponents,
  client: WalletClient<Transport, Chain, Account> | undefined
) {
  const [systemCalls, setSystemCalls] = useState(undefined);

  useEffect(() => {
    if (!client) return;

    const systemCalls = createSystemCalls(network, components, client);
    setSystemCalls(systemCalls);

    // TODO what's the cleanup fn?
  }, [client]);

  return systemCalls;
}
