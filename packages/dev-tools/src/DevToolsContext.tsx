import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DevToolsOptions } from "./common";
import { ContractWrite } from "@latticexyz/common";

const DevToolsContext = createContext<DevToolsOptions | null>(null);

type Props = {
  children: ReactNode;
  value: DevToolsOptions;
};

export const DevToolsProvider = ({ children, value }: Props) => {
  const currentValue = useContext(DevToolsContext);
  if (currentValue) throw new Error("DevToolsProvider can only be used once");
  return <DevToolsContext.Provider value={value}>{children}</DevToolsContext.Provider>;
};

export const useDevToolsContext = () => {
  const value = useContext(DevToolsContext);
  if (!value) throw new Error("Must be used within a DevToolsProvider");

  // TODO: figure out how to stabilize this value so it doesn't get rewritten on renders
  const [writes, setWrites] = useState<ContractWrite[]>([]);
  useEffect(() => {
    const sub = value.write$.subscribe((write) => {
      setWrites((val) => [...val, write]);
    });
    return () => sub.unsubscribe();
  }, [value.write$]);

  return {
    ...value,
    writes,
  };
};
