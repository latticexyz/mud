import { createContext, useContext, type ReactNode } from "react";
import { type Network } from "./setupNetwork";

// A React context that holds the result of `setupNetwork()` (i.e., World's address, Public Client, client store).
// Once set, these values do not change.
const NetworkContext = createContext<Network | null>(null);

type Props = {
  network: Network;
  children: ReactNode;
};

export function NetworkProvider({ network, children }: Props) {
  if (useContext(NetworkContext)) throw new Error("NetworkProvider can only be used once");
  return <NetworkContext.Provider value={network}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const network = useContext(NetworkContext);
  if (!network) throw new Error("Must be used within a NetworkProvider");
  return network;
}
