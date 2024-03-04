import { useMemo, type ReactNode } from "react";
import { WagmiProvider, createConfig, useAccount, useWalletClient } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { WalletClient, Transport, Chain, Account } from "viem";
import { BurnerProvider, type Burner } from "./BurnerContext";
import { useNetwork } from "../NetworkContext";
import { ExternalConnectorPanel } from "./ExternalConnectorPanel";
import { isDelegated, delegateToBurner } from "./delegation";
import { createBurner } from "./createBurner";
import { delegatedActions } from "./delegatedActions";

export function WalletAdapterExternal(props: { children: ReactNode }) {
  const { publicClient } = useNetwork();

  const [wagmiConfig, queryClient] = useMemo(
    () => [
      createConfig({
        chains: [publicClient.chain],
        client: () => publicClient,
      }),
      new QueryClient(),
    ],
    [publicClient],
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ExternalConnectorPanel />
        <Connection>{props.children}</Connection>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Connection(props: { children: ReactNode }) {
  const network = useNetwork();
  const { data: externalWalletClient } = useWalletClient();
  const { chainId } = useAccount();

  if (externalWalletClient && network.publicClient.chain.id === chainId) {
    return <Delegation externalWalletClient={externalWalletClient}>{props.children}</Delegation>;
  }

  return <div>{props.children}</div>;
}

function Delegation(props: { externalWalletClient: WalletClient<Transport, Chain, Account>; children: ReactNode }) {
  const network = useNetwork();

  const burner = useMemo(() => createBurner(network.publicClient.chain), [network.publicClient.chain]);

  const delegation = network.useStore((state) =>
    state.getValue(network.tables.UserDelegationControl, {
      delegator: props.externalWalletClient.account.address,
      delegatee: burner.walletClient.account.address,
    }),
  );

  if (delegation && isDelegated(delegation.delegationControlId)) {
    return (
      <BurnerExtension externalWalletClient={props.externalWalletClient} burner={burner}>
        {props.children}
      </BurnerExtension>
    );
  }

  return (
    <div>
      <button onClick={() => delegateToBurner(network, props.externalWalletClient, burner.walletClient)}>
        Set up burner wallet account
      </button>
      <div>{props.children}</div>
    </div>
  );
}

function BurnerExtension(props: {
  externalWalletClient: WalletClient<Transport, Chain, Account>;
  burner: Burner;
  children: ReactNode;
}) {
  const network = useNetwork();

  const burner = useMemo(() => {
    const walletClient = props.burner.walletClient.extend(
      delegatedActions({
        worldAddress: network.worldAddress,
        delegatorAddress: props.externalWalletClient.account.address,
        getSystemId: (functionSelector) =>
          network.useStore.getState().getValue(network.tables.FunctionSelectors, { functionSelector })!.systemId,
      }),
    );
    return { ...props.burner, walletClient };
  }, [props.burner, props.externalWalletClient.account.address, network]);

  return (
    <div>
      <div>Burner wallet account: {burner.walletClient.account.address}</div>
      <BurnerProvider burner={burner}>{props.children}</BurnerProvider>
    </div>
  );
}
