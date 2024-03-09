import { useNetwork } from "./NetworkContext";
import { useBurner } from "./wallet/BurnerContext";
import { createSystemCalls } from "./createSystemCalls";

// A React hook that provides the network settings and `burner`.
//
// `burner` is available under either of two conditions:
//
// 1. An external wallet (e.g., MetaMask) is connected and has delegated authority to the burner account (i.e., a temporary account).
// 2. A burner account without an external wallet is used.
//
// `burner` includes a `systemCalls` property to facilitate calling Systems.
export function useMUD() {
  const network = useNetwork();
  const burner = useBurner();

  if (burner) return { network, burner: { ...burner, systemCalls: createSystemCalls(network, burner.worldContract) } };

  return { network, burner: undefined };
}
