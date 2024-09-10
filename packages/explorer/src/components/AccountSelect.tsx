import { Connection, useBalance, useConnections } from "wagmi";
import { formatBalance } from "../lib/utils";
import { useAppStore } from "../store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { TruncatedHex } from "./ui/TruncatedHex";

function AccountSelectItem({ connection }: { connection: Connection }) {
  const address = connection.accounts[0];
  const balance = useBalance({
    address,
    query: {
      refetchInterval: 15000,
    },
  });
  const balanceValue = balance.data?.value;
  return (
    <SelectItem key={address} value={address} className="font-mono">
      {connection.connector.name}
      {balanceValue !== undefined && ` (${formatBalance(balanceValue)} ETH)`}{" "}
      <span className="opacity-70">
        (<TruncatedHex hex={address} />)
      </span>
    </SelectItem>
  );
}

export function AccountSelect() {
  const { account, setAccount } = useAppStore();
  const connections = useConnections();
  return (
    <Select value={account} onValueChange={setAccount}>
      <SelectTrigger className="w-[300px] text-left">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {connections.map((connection) => {
          return <AccountSelectItem key={connection.connector.id} connection={connection} />;
        })}
      </SelectContent>
    </Select>
  );
}
