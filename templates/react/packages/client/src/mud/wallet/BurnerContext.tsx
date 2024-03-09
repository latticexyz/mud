import { createContext, useContext, type ReactNode } from "react";
import { type Burner } from "./createBurner";

// A React context that holds the result of `createBurner()` (e.g., Wallet Client, World contract).
const BurnerContext = createContext<Burner | null>(null);

type Props = {
  burner: Burner | null;
  children: ReactNode;
};

export function BurnerProvider({ burner, children }: Props) {
  if (useContext(BurnerContext)) throw new Error("BurnerProvider can only be used once");
  return <BurnerContext.Provider value={burner}>{children}</BurnerContext.Provider>;
}

export function useBurner() {
  // This can be null.
  return useContext(BurnerContext);
}
