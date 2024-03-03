import { type ReactNode } from "react";
import { type WalletAdapterStatus } from "./types";

export function WalletAdapterUnselected(props: {
  setStatus: (status: WalletAdapterStatus) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button onClick={() => props.setStatus("external")}>Use external wallet (with burner delegation)</button>
      {import.meta.env.DEV && <button onClick={() => props.setStatus("burner")}>Use burner wallet</button>}
      <div>{props.children}</div>
    </div>
  );
}
