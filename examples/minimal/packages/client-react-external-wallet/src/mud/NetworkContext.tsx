import { createContext, type ReactNode, useContext } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { type SetupNetworkResult } from "./setupNetwork";

export type MUDNetwork = SetupNetworkResult;

const MUDNetworkContext = createContext<MUDNetwork | null>(null);

type Props = {
  children: ReactNode;
  value: MUDNetwork;
};

export const MUDNetworkProvider = ({ children, value }: Props) => {
  const currentValue = useContext(MUDNetworkContext);
  if (currentValue) throw new Error("MUDNetworkProvider can only be used once");
  return <MUDNetworkContext.Provider value={value}>{children}</MUDNetworkContext.Provider>;
};

export const useMUDNetwork = () => {
  const value = useContext(MUDNetworkContext);
  if (!value) throw new Error("Must be used within a MUDNetworkProvider");
  return value;
};

export const useMUD = () => {
  const network = useMUDNetwork();
  const { data: connectorWalletClient } = useWalletClient();
  const { chainId } = useAccount();

  let externalWalletClient;
  if (network.publicClient.chain.id === chainId && connectorWalletClient?.chain.id === chainId) {
    externalWalletClient = connectorWalletClient;
  }

  return { network, externalWalletClient };
};

export type ExternalWalletClient = NonNullable<ReturnType<typeof useMUD>["externalWalletClient"]>;
