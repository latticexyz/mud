import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useDevToolsContext } from "../DevToolsContext";

export function AccountSummary() {
  const { publicClient, walletClient } = useDevToolsContext();

  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !walletClient) return setBalance(null);
    const account = walletClient.account;
    if (!account) return setBalance(null);

    const updateBalance = async () => {
      const balance = await publicClient.getBalance({ address: account.address });
      setBalance(balance);
    };

    updateBalance();
    const interval = setInterval(updateBalance, 5000);
    return () => clearInterval(interval);
  }, [publicClient, walletClient]);

  return (
    <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
      <dt className="text-amber-200/80">Address</dt>
      <dd className="text-sm">{walletClient?.account?.address}</dd>
      <dt className="text-amber-200/80">Balance</dt>
      <dd className="text-sm" title={balance ? balance.toString() : undefined}>
        {publicClient && balance != null ? (
          <>
            {formatUnits(balance, publicClient.chain.nativeCurrency.decimals).replace(/(\.\d{4})\d+$/, "$1")}{" "}
            {publicClient.chain.nativeCurrency.symbol}
          </>
        ) : null}
      </dd>
    </dl>
  );
}
