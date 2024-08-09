import { Address, formatEther } from "viem";
import { useBalance } from "wagmi";
import { ACCOUNTS, CONFIG } from "../consts";
import { truncateEthAddress } from "../lib/utils";
import { useStore } from "../store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";

function AccountSelectItem({
  address,
  name,
}: {
  address: Address;
  name: string;
}) {
  const balance = useBalance({
    address,
    query: {
      refetchInterval: CONFIG.BALANCES_REFETCH_INTERVAL,
    },
  });
  const balanceValue = balance.data?.value;

  return (
    <SelectItem key={address} value={address} className="font-mono">
      {name}
      {balanceValue !== undefined && ` (${formatEther(balanceValue)} ETH)`}
      <span className="opacity-70"> ({truncateEthAddress(address)})</span>
    </SelectItem>
  );
}

export function AccountSelect() {
  const { account, setAccount } = useStore();

  return (
    <Select value={account} onValueChange={setAccount}>
      <SelectTrigger className="w-[300px] text-left">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {ACCOUNTS.map((address, idx) => {
          return (
            <AccountSelectItem
              key={address}
              address={address}
              name={`Account ${idx + 1}`}
            />
          );
        })}
      </SelectContent>
    </Select>
  );
}
