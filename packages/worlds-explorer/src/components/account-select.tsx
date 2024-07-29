import { useEffect } from "react";
import { formatEther } from "viem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNTS } from "@/consts";
import { useStore } from "@/store";

export function AccountSelect() {
  const { account, setAccount, balances, fetchBalances } = useStore();

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select value={account} onValueChange={setAccount}>
      <SelectTrigger className="w-[300px] text-left">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {ACCOUNTS.map((address, idx) => {
          return (
            <SelectItem key={address} value={address} className="font-mono">
              Account {idx + 1} {balances[address] !== undefined && `(${formatEther(balances[address])} ETH)`}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
