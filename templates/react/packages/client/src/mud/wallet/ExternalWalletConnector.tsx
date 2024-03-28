import { useAccount, useChains, useConnect, useDisconnect, useSwitchChain } from "wagmi";

// A React component that connects to and displays external wallets using Wagmi.
// An external wallet refers to a wallet application outside this app, such as MetaMask.
export function ExternalWalletConnector() {
  const { status } = useAccount();

  return status === "connected" ? <Account /> : <Connect />;
}

// Displays account and chain information from a connected external wallet.
// Offers to switch the chain if it's not supported in this app.
// During the chain switch, the chain will be added to the external wallet if it's not already present.
function Account() {
  const { status, address, connector, chain, chainId } = useAccount();
  if (status !== "connected") throw new Error("Must be used after connection");

  const { switchChain, error } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const chains = useChains(); // This is the same as the `chains` in Wagmi's `createConfig({chains})`.

  return (
    <div>
      <div>External wallet account: {address}</div>

      <div>
        Connected to {chain?.name ?? `chain ${chainId}`}
        {chains.map((c) => c.id).includes(chainId) || " (unsupported)"}
      </div>

      <div>
        {chains
          .filter((c) => c.id !== chainId)
          .map((c) => (
            <button key={c.id} onClick={() => switchChain({ chainId: c.id })}>
              Switch to {c.name}
            </button>
          ))}
      </div>

      <div>{error?.message}</div>

      <div>
        <button onClick={() => disconnect()}>Disconnect from {connector.name}</button>
      </div>
    </div>
  );
}

// Lists connection buttons for available external wallets.
function Connect() {
  const { connect, connectors, error } = useConnect();

  if (!connectors.length) return <div>No external wallet found.</div>;

  return (
    <div>
      <div>
        {connectors.map((connector) => (
          <button key={connector.uid} onClick={() => connect({ connector })}>
            Connect to {connector.name}
          </button>
        ))}
      </div>

      <div>{error?.message}</div>
    </div>
  );
}
