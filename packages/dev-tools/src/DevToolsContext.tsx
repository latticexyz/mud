import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DevToolsOptions } from "./common";
import { ContractWrite } from "@latticexyz/common";
import { StorageAdapterLog } from "@latticexyz/store-sync";

type DevToolsContextValue = DevToolsOptions & {
  writes: ContractWrite[];
  storedLogs: StorageAdapterLog[];
};

const DevToolsContext = createContext<DevToolsContextValue | null>(null);

type Props = {
  children: ReactNode;
  value: DevToolsOptions;
};

export const DevToolsProvider = ({ children, value }: Props) => {
  const currentValue = useContext(DevToolsContext);
  if (currentValue) throw new Error("DevToolsProvider can only be used once");

  const [writes, setWrites] = useState<ContractWrite[]>([]);
  useEffect(() => {
    const sub = value.write$.subscribe((write) => {
      setWrites((val) => [...val, write]);
    });
    return () => sub.unsubscribe();
  }, [value.write$]);

  const [storedLogs, setStoredLogs] = useState<StorageAdapterLog[]>([]);
  useEffect(() => {
    const sub = value.storedBlockLogs$.subscribe(({ logs }) => {
      setStoredLogs((val) => [...val, ...logs]);
    });
    return () => sub.unsubscribe();
  }, [value.storedBlockLogs$]);

  return (
    <DevToolsContext.Provider
      value={{
        ...value,
        writes,
        storedLogs,
      }}
    >
      {children}
    </DevToolsContext.Provider>
  );
};

export const useDevToolsContext = () => {
  const value = useContext(DevToolsContext);
  if (!value) throw new Error("Must be used within a DevToolsProvider");
  return value;
};
