import { createContext, ReactNode, useContext } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { type SetupNetworkResult } from "./mud/setupNetwork";

const MUDContext = createContext<SetupNetworkResult | null>(null);

type Props = {
  children: ReactNode;
  value: SetupNetworkResult;
};

export const MUDProvider = ({ children, value }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");
  return <MUDContext.Provider value={value}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const network = useContext(MUDContext);
  if (!network) throw new Error("Must be used within a MUDProvider");

  const { data: connectorWalletClient } = useWalletClient();
  const { chainId } = useAccount();

  let externalWalletClient;
  if (network.publicClient.chain.id === chainId && connectorWalletClient?.chain.id === chainId) {
    externalWalletClient = connectorWalletClient;
  }

  return { network, externalWalletClient };
};

export type ExternalWalletClient = NonNullable<ReturnType<typeof useMUD>["externalWalletClient"]>;
