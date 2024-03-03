import { createContext, useContext, type ReactNode } from "react";
import { type Network } from "./setupNetwork";

const NetworkContext = createContext<Network | null>(null);

type Props = {
  children: ReactNode;
  network: Network;
};

export function NetworkProvider({ children, network }: Props) {
  if (useContext(NetworkContext)) throw new Error("NetworkProvider can only be used once");
  return <NetworkContext.Provider value={network}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const network = useContext(NetworkContext);
  if (!network) throw new Error("Must be used within a NetworkProvider");
  return network;
}
