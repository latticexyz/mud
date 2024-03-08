import { createContext, useContext, type ReactNode } from "react";
import { type Burner } from "./burner";

const BurnerContext = createContext<Burner | null>(null);

export function BurnerProvider(props: { burner: Burner | null; children: ReactNode }) {
  if (useContext(BurnerContext)) throw new Error("BurnerProvider can only be used once");
  return <BurnerContext.Provider value={props.burner}>{props.children}</BurnerContext.Provider>;
}

export function useBurner() {
  return useContext(BurnerContext);
}
