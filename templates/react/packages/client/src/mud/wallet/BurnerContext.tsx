import { createContext, useContext, type ReactNode } from "react";
import type { WalletClient, Transport, Chain, Account } from "viem";
import { type Observable } from "rxjs";
import { type ContractWrite } from "@latticexyz/common";

export type Burner = { walletClient: WalletClient<Transport, Chain, Account>; write$: Observable<ContractWrite> };

export const BurnerContext = createContext<Burner | null>(null);

export function BurnerProvider(props: { burner: Burner; children: ReactNode }) {
  if (useContext(BurnerContext)) throw new Error("BurnerProvider can only be used once");
  return <BurnerContext.Provider value={props.burner}>{props.children}</BurnerContext.Provider>;
}
