import { useEffect } from "react";
import type { WalletClient, Transport, Chain, Account, Hex } from "viem";
import type { SetBurnerProps } from "../types";
import { useNetwork } from "../../NetworkContext";
import { useExternalWalletClient } from "../useExternalWalletClient";
import { useDelegation } from "../useDelegation";
import { createBurner } from "../createBurner";
import { ExternalWalletConnector } from "../ExternalWalletConnector";

// Allows a user to connect an external wallet and then register delegation between the external account and a burner account.
export function ExternalWithDelegatedBurner({ setBurner }: SetBurnerProps) {
  const externalWalletClient = useExternalWalletClient();

  return (
    <>
      <ExternalWalletConnector />
      {externalWalletClient && <Delegation setBurner={setBurner} externalWalletClient={externalWalletClient} />}
    </>
  );
}

function Delegation({
  setBurner,
  externalWalletClient,
}: SetBurnerProps & { externalWalletClient: WalletClient<Transport, Chain, Account> }) {
  const { status, setupDelegation } = useDelegation(externalWalletClient);

  if (status === "delegated") {
    return <SetBurner setBurner={setBurner} externalWalletAccountAddress={externalWalletClient.account.address} />;
  }

  return (
    <div>
      <button onClick={setupDelegation}>Set up burner account</button>
    </div>
  );
}

function SetBurner({
  setBurner,
  externalWalletAccountAddress,
}: SetBurnerProps & { externalWalletAccountAddress: Hex }) {
  const network = useNetwork();

  useEffect(
    () => setBurner(createBurner(network, externalWalletAccountAddress)),
    [setBurner, network, externalWalletAccountAddress],
  );

  return null;
}
