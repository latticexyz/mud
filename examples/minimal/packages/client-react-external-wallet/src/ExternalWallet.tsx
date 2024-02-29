import { BaseError } from "viem";
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

export const ExternalWallet = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      <Connect />
      {isConnected && <Network />}
    </div>
  );
};

// Based on https://github.com/wevm/create-wagmi/blob/create-wagmi%401.0.5/templates/vite-react/default/src/components/Connect.tsx
function Connect() {
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

// Based on https://github.com/wevm/create-wagmi/blob/create-wagmi%401.0.5/templates/vite-react/default/src/components/NetworkSwitcher.tsx
function Network() {
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
      {switchNetwork && !!otherChains.length && (
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
