import { SyncStep } from "@latticexyz/store-sync";
import { useMUD } from "./mud/NetworkContext";
import { increment, isDelegated, delegateToBurner } from "./mud/systemCalls";

export const App = () => {
  const {
    network: { useStore, tables },
    externalWalletClient,
  } = useMUD();

  const counter = useStore((state) => state.getValue(tables.CounterTable, {}));

  return (
    <div>
      <div>Counter: {counter?.value ?? "unset"}</div>
      {externalWalletClient && <Incrementer />}
    </div>
  );
};

const Incrementer = () => {
  const {
    network: { useStore, tables, worldAddress, publicClient, burnerClient },
    externalWalletClient,
  } = useMUD();

  if (!externalWalletClient) throw new Error("Must be used after an external wallet connection");

  const syncProgress = useStore((state) => state.syncProgress);

  const delegation = useStore((state) =>
    state.getValue(tables.UserDelegationControl, {
      delegator: externalWalletClient.account.address,
      delegatee: burnerClient.account.address,
    })
  );

  if (syncProgress.step !== SyncStep.LIVE) {
    return <div>Loading</div>;
  }

  if (delegation && isDelegated(delegation.delegationControlId)) {
    return (
      <div>
        <div>Burner wallet account: {burnerClient.account.address}</div>
        <button type="button" onClick={() => increment(worldAddress, publicClient, externalWalletClient, burnerClient)}>
          Increment
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => delegateToBurner(worldAddress, publicClient, externalWalletClient, burnerClient)}
      >
        Set up burner wallet account
      </button>
    </div>
  );
};
