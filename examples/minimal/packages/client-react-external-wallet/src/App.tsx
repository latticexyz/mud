import { SyncStep } from "@latticexyz/store-sync";
import { useMUD, type MUDNetwork, type ExternalWalletClient } from "./mud/NetworkContext";
import { increment, isDelegated, delegateToBurner } from "./mud/systemCalls";

export const App = () => {
  const { network, externalWalletClient } = useMUD();

  const counter = network.useStore((state) => state.getValue(network.tables.CounterTable, {}));

  return (
    <div>
      <div>Counter: {counter?.value ?? "unset"}</div>
      {externalWalletClient && <Incrementer network={network} externalWalletClient={externalWalletClient} />}
    </div>
  );
};

const Incrementer = ({
  network,
  externalWalletClient,
}: {
  network: MUDNetwork;
  externalWalletClient: ExternalWalletClient;
}) => {
  const syncProgress = network.useStore((state) => state.syncProgress);

  const delegation = network.useStore((state) =>
    state.getValue(network.tables.UserDelegationControl, {
      delegator: externalWalletClient.account.address,
      delegatee: network.burnerWalletClient.account.address,
    })
  );

  if (syncProgress.step !== SyncStep.LIVE) {
    return <div>Loading</div>;
  }

  if (delegation && isDelegated(delegation.delegationControlId)) {
    return (
      <div>
        <div>Burner wallet account: {network.burnerWalletClient.account.address}</div>
        <button type="button" onClick={() => increment(externalWalletClient, network)}>
          Increment
        </button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => delegateToBurner(externalWalletClient, network)}>
        Set up burner wallet account
      </button>
    </div>
  );
};
