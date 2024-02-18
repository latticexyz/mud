import { createContext, type ReactNode, useContext } from "react";
import { type SetupNetworkResult } from "./setupNetwork";

export type MUDRead = SetupNetworkResult;

const MUDReadContext = createContext<MUDRead | null>(null);

type Props = {
  children: ReactNode;
  value: MUDRead;
};

export const MUDReadProvider = ({ children, value }: Props) => {
  const currentValue = useContext(MUDReadContext);
  if (currentValue) throw new Error("MUDReadProvider can only be used once");
  return <MUDReadContext.Provider value={value}>{children}</MUDReadContext.Provider>;
};

export const useMUDRead = () => {
  const value = useContext(MUDReadContext);
  if (!value) throw new Error("Must be used within a MUDReadProvider");
  return value;
};
