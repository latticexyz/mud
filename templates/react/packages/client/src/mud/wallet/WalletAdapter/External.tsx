import { useMemo, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient, Transport, Chain, Account, Hex } from "viem";
import { useNetwork } from "../../NetworkContext";
import { ExternalConnector } from "../ExternalConnector";
import { isDelegated, delegateToBurner } from "../delegation";
import { createBurner, getBurnerAddress } from "../burner";
import { type SetBurnerProps } from "./types";

export function External(props: SetBurnerProps) {
  return (
    <>
      <ExternalConnector />
      <Connection setBurner={props.setBurner} />
    </>
  );
}

function Connection(props: SetBurnerProps) {
  const network = useNetwork();
  const { data: externalWalletClient } = useWalletClient();
  const { chainId } = useAccount();

  if (externalWalletClient && chainId === network.publicClient.chain.id) {
    return <Delegation setBurner={props.setBurner} externalWalletClient={externalWalletClient} />;
  }

  return null;
}

function Delegation(props: SetBurnerProps & { externalWalletClient: WalletClient<Transport, Chain, Account> }) {
  const network = useNetwork();

  const burnerAddress = useMemo(() => getBurnerAddress(), []);

  const delegation = network.useStore((state) =>
    state.getValue(network.tables.UserDelegationControl, {
      delegator: props.externalWalletClient.account.address,
      delegatee: burnerAddress,
    }),
  );

  if (delegation && isDelegated(delegation.delegationControlId)) {
    return (
      <Content setBurner={props.setBurner} externalWalletAccountAddress={props.externalWalletClient.account.address} />
    );
  }

  return (
    <div>
      <button onClick={() => delegateToBurner(network, props.externalWalletClient, burnerAddress)}>
        Set up burner wallet account
      </button>
    </div>
  );
}

function Content(props: SetBurnerProps & { externalWalletAccountAddress: Hex }) {
  const network = useNetwork();

  useEffect(() => props.setBurner(createBurner(network, props.externalWalletAccountAddress)), [network]);

  return null;
}
