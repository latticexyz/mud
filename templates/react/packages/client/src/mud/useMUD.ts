import { useContext } from "react";
import { useNetwork } from "./NetworkContext";
import { BurnerContext } from "./wallet/BurnerContext";

export function useMUD() {
  const network = useNetwork();
  const burner = useContext(BurnerContext);

  return { network, burner };
}
