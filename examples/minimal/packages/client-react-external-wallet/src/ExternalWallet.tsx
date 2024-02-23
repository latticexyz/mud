import { type BaseError } from "viem";
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchChain, useSwitchNetwork } from "wagmi";

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
  const account = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <div>
        {account.status === "connected" && <button onClick={() => disconnect()}>Disconnect</button>}

        {connectors.map((x) => (
          <button key={x.uid} onClick={() => connect({ connector: x })}>
            Connect {x.name}
          </button>
        ))}
      </div>

      <div>{status}</div>
      {error && <div>{error.message}</div>}
    </div>
  );
}

// Based on https://github.com/wevm/create-wagmi/blob/create-wagmi%401.0.5/templates/vite-react/default/src/components/NetworkSwitcher.tsx
function Network() {
  const { chain } = useNetwork();
  const { chains, error, status, switchChain } = useSwitchChain();
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
