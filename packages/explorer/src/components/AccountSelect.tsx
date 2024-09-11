import { Connection, useAccount, useBalance, useConnections, useSwitchAccount } from "wagmi";
import { formatBalance } from "../lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { TruncatedHex } from "./ui/TruncatedHex";

function AccountSelectItem({ connection }: { connection: Connection }) {
  const address = connection.accounts[0];
  const { data: balance } = useBalance({
    address,
    query: {
      refetchInterval: 15000,
      select: (data) => {
        return data?.value;
      },
    },
  });

  return (
    <SelectItem key={address} value={connection.connector.id} className="font-mono">
      {connection.connector.name}
      {balance !== undefined && ` (${formatBalance(balance)} ETH)`}{" "}
      <span className="opacity-70">
        (<TruncatedHex hex={address} />)
      </span>
    </SelectItem>
  );
}

export function AccountSelect() {
  const account = useAccount();
  const connections = useConnections();
  const { switchAccount, connectors } = useSwitchAccount();

  return (
    <Select
      value={account.connector?.id}
      onValueChange={(value) => {
        const connectorIdx = connectors.findIndex((connector) => connector.id === value);
        switchAccount({ connector: connectors[connectorIdx] });
      }}
    >
      <SelectTrigger className="w-[300px] text-left" disabled={!connections.length}>
        <SelectValue placeholder="Select acccount ..." />
      </SelectTrigger>
      <SelectContent>
        {[...connections]
          .sort((a, b) => a.connector.id.localeCompare(b.connector.id))
          .map((connection) => {
            return <AccountSelectItem key={connection.connector.id} connection={connection} />;
          })}
      </SelectContent>
    </Select>
  );
}
