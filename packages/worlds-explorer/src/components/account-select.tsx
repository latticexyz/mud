import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNTS } from "@/consts";
import { useEffect, useState } from "react";
import { formatEther, fromHex, Hex } from "viem";

type BalanceResponse = {
  id: number;
  result: Hex;
};

type Balances = {
  [key: string]: bigint;
};

export function AccountSelect() {
  const [balances, setBalances] = useState<Balances>({});

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const requests = ACCOUNTS.map((account, i) => ({
          method: "eth_getBalance",
          params: [account, "latest"],
          id: i,
          jsonrpc: "2.0",
        }));

        const response = await fetch("http://127.0.0.1:8545", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requests),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BalanceResponse[] = await response.json();
        const fetchedBalances: Balances = {};
        for (let i = 0; i < data.length; i++) {
          fetchedBalances[ACCOUNTS[i]] = fromHex(data[i].result, "bigint");
        }

        setBalances(fetchedBalances);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchBalances();
  }, []);

  return (
    <Select defaultValue={ACCOUNTS[0]}>
      <SelectTrigger className="w-[300px] text-left">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {ACCOUNTS.map((address, idx) => {
          return (
            <SelectItem key={address} value={address}>
              Account {idx + 1} {balances[address] !== undefined && `(${formatEther(balances[address])} ETH)`}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
