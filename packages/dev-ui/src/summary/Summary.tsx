import { useObservableValue } from "@latticexyz/react";
import {
  publicClient as publicClientObservable,
  walletClient as walletClientObservable,
} from "@latticexyz/network/dev";
import { useEffect, useState } from "react";

export function Summary() {
  // TODO: if observable is `BehaviorSubject`, `useObservableValue` should initialize with the current value (not undefined)
  const publicClient = useObservableValue(publicClientObservable);
  const walletClient = useObservableValue(walletClientObservable);

  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

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
    <div className="p-2">
      chain: {publicClient?.chain?.id}
      <br />
      block number: {blockNumber?.toString()}
      <br />
      wallet: {walletClient?.account?.address}
      <br />
      balance: {balance?.toString()}
    </div>
  );
}
