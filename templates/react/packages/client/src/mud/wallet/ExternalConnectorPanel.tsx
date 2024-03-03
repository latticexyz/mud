import { useAccount, useChains, useConnect, useDisconnect, useSwitchChain } from "wagmi";

export function ExternalConnectorPanel() {
  const { isConnected } = useAccount();

  return <div>{isConnected ? <Account /> : <Connect />}</div>;
}

function Connect() {
  const { connect, connectors, error } = useConnect();

  if (!connectors.length) return <div>No external wallet found</div>;

  return (
    <div>
      <div>
        {connectors.map((connector) => (
          <button key={connector.uid} onClick={() => connect({ connector })}>
            Connect {connector.name}
          </button>
        ))}
      </div>

      <div>{error?.message}</div>
    </div>
  );
}

function Account() {
  const { error, switchChain } = useSwitchChain();
  const { address, connector, chain, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const chains = useChains();

  return (
    <div>
      <div>External wallet account: {address}</div>
      <div>
        Connected to {chain?.name ?? chainId}
        {chainId && !chains.map((x) => x.id).includes(chainId) ? " (unsupported)" : ""}
      </div>
      <div>
        {chains
          .filter((x) => x.id !== chainId)
          .map((x) => (
            <button key={x.id} onClick={() => switchChain({ chainId: x.id })}>
              Switch to {x.name}
            </button>
          ))}
      </div>

      <div>{error?.message}</div>

      <div>
        <button onClick={() => disconnect()}>Disconnect from {connector?.name}</button>
      </div>
    </div>
  );
}
