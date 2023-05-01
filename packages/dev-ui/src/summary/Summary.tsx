import { useObservableValue } from "@latticexyz/react";
import {
  publicClient as publicClientObservable,
  walletClient as walletClientObservable,
} from "@latticexyz/network/dev";
import { useEffect, useState } from "react";
import { StoreEventsTable } from "../store-log/StoreEventsTable";
import { useNetworkStore } from "../useNetworkStore";
import { NavButton } from "../NavButton";

export function Summary() {
  // TODO: if observable is `BehaviorSubject`, `useObservableValue` should initialize with the current value (not undefined)
  const publicClient = useObservableValue(publicClientObservable);
  const walletClient = useObservableValue(walletClientObservable);

  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

  const recentStoreEvents = useNetworkStore((state) => state.storeEvents.slice(-10).reverse());

  useEffect(() => {
    if (!publicClient) return;
    return publicClient.watchBlockNumber({
      onBlockNumber: (blockNumber) => {
        setBlockNumber(blockNumber);
      },
      emitOnBegin: true,
    });
  }, [publicClient]);

  useEffect(() => {
    if (!publicClient || !walletClient) return;
    const account = walletClient.account;
    if (!account) return;

    const updateBalance = async () => {
      const balance = await publicClient.getBalance({ address: account.address });
      setBalance(balance);
    };

    updateBalance();
    const interval = setInterval(updateBalance, 5000);
    return () => clearInterval(interval);
  }, [publicClient, walletClient]);

  return (
    <>
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Network</h1>
          <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
            <dt className="text-amber-200/80">Chain</dt>
            <dd className="font-mono text-sm">
              {publicClient?.chain?.id} ({publicClient?.chain?.name})
            </dd>
            <dt className="text-amber-200/80">Block number</dt>
            <dd className="font-mono text-sm">{blockNumber?.toString()}</dd>
            <dt className="text-amber-200/80">RPC</dt>
            <dd className="font-mono text-sm">Connected</dd>
            <dt className="text-amber-200/80">MODE</dt>
            <dd className="font-mono text-sm text-white/40">Not available</dd>
          </dl>
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Burner wallet</h1>
          <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
            <dt className="text-amber-200/80">Address</dt>
            <dd className="font-mono text-sm">{walletClient?.account?.address}</dd>
            <dt className="text-amber-200/80">Balance</dt>
            <dd className="font-mono text-sm">
              {balance?.toString()} {publicClient?.chain?.nativeCurrency.symbol}
            </dd>
          </dl>
        </div>
        <div className="space-y-1">
          <h1 className="font-bold text-white/40 uppercase text-xs">Recent store events</h1>
          <StoreEventsTable storeEvents={recentStoreEvents} />
          <NavButton to="/store-log" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
            See more
          </NavButton>
        </div>
      </div>
    </>
  );
}
