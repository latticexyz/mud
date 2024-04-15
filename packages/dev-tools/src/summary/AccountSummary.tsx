import { useEffect, useState } from "react";
import { formatUnits, parseEther, testActions } from "viem";
import { useDevToolsContext } from "../DevToolsContext";

export function AccountSummary() {
  const { publicClient, walletClient } = useDevToolsContext();
  const walletAddress = walletClient?.account?.address;
  const testClient = publicClient.chain.id === 31337 ? publicClient.extend(testActions({ mode: "anvil" })) : null;

  const [balance, setBalance] = useState<bigint | null>(null);

  // TODO: switch to wagmi hooks
  useEffect(() => {
    if (!publicClient || !walletClient) return setBalance(null);
    const account = walletClient.account;
    if (!account) return setBalance(null);

    const updateBalance = async () => {
      const balance = await publicClient.getBalance({ address: account.address });
      setBalance(balance);
    };

    updateBalance();
    const interval = setInterval(updateBalance, publicClient.pollingInterval);
    return () => clearInterval(interval);
  }, [publicClient, walletClient]);

  return (
    <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
      <dt className="text-amber-200/80">Address</dt>
      <dd className="text-sm">{walletAddress}</dd>
      <dt className="text-amber-200/80">Balance</dt>
      <dd className="text-sm flex items-center gap-2" title={balance ? balance.toString() : undefined}>
        {publicClient && balance != null ? (
          <span>
            {formatUnits(balance, publicClient.chain.nativeCurrency.decimals).replace(/(\.\d{4})\d+$/, "$1")}{" "}
            {publicClient.chain.nativeCurrency.symbol}
          </span>
        ) : null}
        {walletAddress && testClient ? (
          <button
            type="button"
            className="text-xs px-1.5 py-0.5 bg-slate-700 hover:bg-blue-700 hover:text-white rounded"
            onClick={() => testClient.setBalance({ address: walletAddress, value: parseEther("1") + (balance ?? 0n) })}
          >
            top up
          </button>
        ) : null}
      </dd>
    </dl>
  );
}
