import { useState, type ReactNode } from "react";
import { type WalletAdapterStatus } from "./types";
import { WalletAdapterUnselected } from "./WalletAdapterUnselected";
import { WalletAdapterExternal } from "./WalletAdapterExternal";
import { WalletAdapterBurner } from "./WalletAdapterBurner";

export function WalletAdapter(props: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletAdapterStatus>("unselected");

  switch (status) {
    case "unselected":
      return <WalletAdapterUnselected setStatus={setStatus}>{props.children}</WalletAdapterUnselected>;
    case "external":
      return <WalletAdapterExternal>{props.children}</WalletAdapterExternal>;
    case "burner":
      return <WalletAdapterBurner>{props.children}</WalletAdapterBurner>;
  }
}
