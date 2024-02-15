import { useState, useEffect } from "react";
import { BaseError } from "viem";
import {
  usePublicClient,
  useWalletClient,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { share } from "rxjs";
import { useNetworkConfig, useWorldContract } from "./mud/networkConfig";
import { syncStore, StoreProvider, useStore, type Store } from "./mud/store";
import mudConfig from "contracts/mud.config";

export const App = () => {
  const networkConfig = useNetworkConfig();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    syncStore(networkConfig, publicClient).then(setStore);
  }, []);

  return (
    <>
      <Connect />
      {isConnected && <Wallet />}
      {store && (
        <StoreProvider store={store}>
          <Synced />
        </StoreProvider>
      )}
    </>
  );
};

export const Synced = () => {
  const store = useStore();
  const { chain } = useNetwork();
  const networkConfig = useNetworkConfig();
  const { data: walletClient } = useWalletClient();

  const counter = store.useStore((state) => state.getValue(store.tables.CounterTable, {}));

  return (
    <>
      <div>Counter: {counter?.value ?? "unset"}</div>
      <div>{walletClient && chain && chain!.id === networkConfig.chainId && <Connected />}</div>
    </>
  );
};

const Connected = () => {
  const store = useStore();
  const {
    worldContract: { worldContract, write$ },
    publicClient,
    walletClient,
  } = useWorldContract();

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount }) =>
        mount({
          config: mudConfig,
          publicClient: publicClient,
          walletClient: walletClient,
          latestBlock$: store.latestBlock$,
          storedBlockLogs$: store.storedBlockLogs$,
          worldAddress: worldContract.address,
          worldAbi: worldContract.abi,
          write$: write$.asObservable().pipe(share()),
          useStore: store.useStore,
        })
      );
    }
  }, [walletClient.account.address]);

  return (
    <button type="button" onClick={() => worldContract.write.increment()}>
      Increment
    </button>
  );
};

// Based on https://github.com/wevm/create-wagmi/blob/create-wagmi%401.0.5/templates/vite-react/default/src/App.tsx#L28
export function Connect() {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <div>
        {isConnected && <button onClick={() => disconnect()}>Disconnect from {connector?.name}</button>}

        {connectors
          .filter((x) => x.ready && x.id !== connector?.id)
          .map((x) => (
            <button key={x.id} onClick={() => connect({ connector: x })}>
              Connect {x.name}
              {isLoading && x.id === pendingConnector?.id && " (connecting)"}
            </button>
          ))}
      </div>

      {error && <div>{(error as BaseError).shortMessage}</div>}
    </div>
  );
}

export function Wallet() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();

  const otherChains = chains.filter((x) => x.id !== chain?.id);

  return (
    <div>
      <div>{address}</div>
      <div>
        Connected to {chain?.name ?? chain?.id}
        {chain?.unsupported && " (unsupported)"}
      </div>
      <br />
      {switchNetwork && otherChains.length && (
        <div>
          Switch to:{" "}
          {otherChains.map((x) => (
            <button key={x.id} onClick={() => switchNetwork(x.id)}>
              {x.name}
              {isLoading && x.id === pendingChainId && " (switching)"}
            </button>
          ))}
        </div>
      )}

      <div>{error?.message}</div>
    </div>
  );
}
