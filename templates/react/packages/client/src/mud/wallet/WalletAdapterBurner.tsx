import { useMemo, type ReactNode } from "react";
import { BurnerProvider } from "./BurnerContext";
import { useNetwork } from "../NetworkContext";
import { createBurner } from "./createBurner";

export function WalletAdapterBurner(props: { children: ReactNode }) {
  const network = useNetwork();
  const burner = useMemo(() => createBurner(network), [network]);

  return <BurnerProvider burner={burner}>{props.children}</BurnerProvider>;
}
