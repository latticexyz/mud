import { useMemo, type ReactNode } from "react";
import { BurnerProvider } from "./BurnerContext";
import { useNetwork } from "../NetworkContext";
import { createBurner } from "./createBurner";

export function WalletAdapterBurner(props: { children: ReactNode }) {
  const { publicClient } = useNetwork();
  const burner = useMemo(() => createBurner(publicClient.chain), [publicClient.chain]);

  return <BurnerProvider burner={burner}>{props.children}</BurnerProvider>;
}
