import { createContext, type ReactNode, useContext } from "react";
import { type PublicClient } from "wagmi";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { type NetworkConfig } from "./networkConfig";
import mudConfig from "contracts/mud.config";

export type Store = Awaited<ReturnType<typeof syncStore>>;

export const syncStore = async (networkConfig: NetworkConfig, publicClient: PublicClient) => {
  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
    config: mudConfig,
    address: networkConfig.worldAddress,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  return { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction };
};

const StoreContext = createContext<Store | null>(null);

type Props = {
  children: ReactNode;
  store: Store;
};

export const StoreProvider = ({ children, store }: Props) => {
  const currentValue = useContext(StoreContext);
  if (currentValue) throw new Error("StoreProvider can only be used once");
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Must be used within a StoreProvider");
  return value;
};
