import { useState, useCallback, type ReactNode } from "react";
import { type WalletManagerState } from "../types";
import { type Burner } from "../createBurner";
import { BurnerProvider } from "../BurnerContext";
import { Unset } from "./Unset";
import { ExternalWithDelegatedBurner } from "./ExternalWithDelegatedBurner";
import { StandaloneBurner } from "./StandaloneBurner";

type Props = {
  children: ReactNode;
};

// A React component that manages wallets.
// Always renders `children`, but the value (i.e., `burner`) of `BurnerContext`, which wraps `children`, changes based on user interaction.
//
// An external wallet refers to a wallet application outside this app, such as MetaMask.
// A burner account refers to a temporary account stored in local storage.
//
// It can be in one of three states: unset, external-with-delegated-burner, and standalone-burner.
//
// - unset: An initial state. Allows a user to select either external-with-delegated-burner or standalone-burner. `burner` is not set at this point.
//
// - external-with-delegated-burner: Allows a user to connect an external wallet and then register delegation between the external account and a burner account. Once the delegation is complete, `burner` is set.
//
// - standalone-burner: Sets `burner` without using an external wallet. No additional user interaction is involved.
export function WalletManager({ children }: Props) {
  const [state, setState] = useState<WalletManagerState>("unset");
  const [burner, setBurner] = useState<Burner | null>(null);

  const setBurnerWithCleanup = useCallback((burner: Burner) => {
    setBurner(burner);
    return () => setBurner(null);
  }, []);

  let component;
  switch (state) {
    case "unset":
      component = <Unset setState={setState} />;
      break;
    case "external-with-delegated-burner":
      component = <ExternalWithDelegatedBurner setBurner={setBurnerWithCleanup} />;
      break;
    case "standalone-burner":
      component = <StandaloneBurner setBurner={setBurnerWithCleanup} />;
      break;
    default:
      throw new Error(`Unsupported state: ${state}`);
  }

  return (
    <>
      {component}
      {burner && <div>Burner account: {burner.walletClient.account.address}</div>}
      <hr />
      <BurnerProvider burner={burner}>{children}</BurnerProvider>
    </>
  );
}
