import { createContext, ReactNode, useContext } from "react";
import { DevToolsOptions } from "./common";

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
  return value;
};
