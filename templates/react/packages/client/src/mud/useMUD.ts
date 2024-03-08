import { useNetwork } from "./NetworkContext";
import { useBurner } from "./wallet/BurnerContext";
import { createSystemCalls } from "./createSystemCalls";

export function useMUD() {
  const network = useNetwork();
  const burner = useBurner();

  if (burner) {
    return { network, burner: { ...burner, systemCalls: createSystemCalls(network, burner.worldContract) } };
  }

  return { network, burner };
}
