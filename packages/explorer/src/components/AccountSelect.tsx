import { Address } from "viem";
import { useBalance } from "wagmi";
import { ACCOUNTS } from "../consts";
import { formatBalance } from "../lib/utils";
import { useAppStore } from "../store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { TruncatedHex } from "./ui/TruncatedHex";

function AccountSelectItem({ address, name }: { address: Address; name: string }) {
  const balance = useBalance({
    address,
    query: {
      refetchInterval: 15000,
    },
  });
  const balanceValue = balance.data?.value;
  return (
    <SelectItem key={address} value={address} className="font-mono">
      {name}
      {balanceValue !== undefined && ` (${formatBalance(balanceValue)} ETH)`}{" "}
      <span className="opacity-70">
        (<TruncatedHex hex={address} />)
      </span>
    </SelectItem>
  );
}

export function AccountSelect() {
  const { account, setAccount } = useAppStore();
  return (
    <Select value={account} onValueChange={setAccount}>
      <SelectTrigger className="w-[300px] text-left">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {ACCOUNTS.map((address, index) => {
          return <AccountSelectItem key={address} address={address} name={`Account ${index + 1}`} />;
        })}
      </SelectContent>
    </Select>
  );
}
