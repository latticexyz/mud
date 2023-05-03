import React from "react";
import { createContext, ReactNode, useContext } from "react";
import { SetupResult } from "./mud/setup";

const MUDContext = createContext<SetupResult | null>(null);

type Props = SetupResult & {
  children: ReactNode;
};

export const MUDProvider = ({ children, ...value }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");
  return <MUDContext.Provider value={value}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
