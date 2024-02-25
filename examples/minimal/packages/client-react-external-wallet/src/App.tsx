import { useMUD } from "./mud/customWalletClient";
import { increment } from "./mud/systemCalls";

export const App = () => {
  const { network, walletClient } = useMUD();

  const counter = network.useStore((state) => state.getValue(network.tables.CounterTable, {}));

  return (
    <div>
      <div>Counter: {counter?.value ?? "unset"}</div>
      <div>
        {walletClient && (
          <button type="button" onClick={() => increment(walletClient, network)}>
            Increment
          </button>
        )}
      </div>
    </div>
  );
};
