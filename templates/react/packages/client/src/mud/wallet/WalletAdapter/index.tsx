import { useState, type ReactNode } from "react";
import { type Status } from "./types";
import { BurnerProvider } from "../BurnerContext";
import { BurnerAddress } from "../BurnerAddress";
import { type Burner } from "../burner";
import { Unselected } from "./Unselected";
import { External } from "./External";
import { Burner as BurnerComponent } from "./Burner";

export function WalletAdapter(props: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("unselected");
  const [burner, setBurner] = useState<Burner | null>(null);

  const setBurnerWithCleanup = (burner: Burner) => {
    setBurner(burner);
    return () => setBurner(null);
  };

  let component;
  switch (status) {
    case "unselected":
      component = <Unselected setStatus={setStatus} />;
      break;
    case "external":
      component = <External setBurner={setBurnerWithCleanup} />;
      break;
    case "burner":
      component = <BurnerComponent setBurner={setBurnerWithCleanup} />;
      break;
    default:
      throw new Error("Unreachable");
  }

  return (
    <>
      {component}
      <BurnerProvider burner={burner}>
        <BurnerAddress />
        {props.children}
      </BurnerProvider>
    </>
  );
}
