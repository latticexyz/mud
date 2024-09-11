import { CirclePlusIcon, PlugIcon } from "lucide-react";
import { Address } from "viem";
import { Connector, useAccount, useBalance, useConnect, useConnectors } from "wagmi";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatBalance } from "../lib/utils";
import { StyledConnectButton } from "./ConnectButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { TruncatedHex } from "./ui/TruncatedHex";

function AccountSelectItem({ connector }: { connector: Connector }) {
  const [accounts, setAccounts] = useState<readonly Address[]>([]);
  const address = accounts[0];

  useEffect(() => {
    async function getAccounts() {
      const accounts = await connector.getAccounts();
      setAccounts(accounts);
    }
    getAccounts();
  }, [connector]);

  const { data: balance } = useBalance({
    address,
    query: {
      refetchInterval: 15000,
      select: (data) => {
        return data?.value;
      },
      enabled: !!address,
    },
  });

  return (
    <SelectItem key={address} value={connector.id} className="font-mono">
      {connector.name}
      {balance !== undefined && ` (${formatBalance(balance)} ETH)`}{" "}
      {address && (
        <span className="opacity-70">
          (<TruncatedHex hex={address} />)
        </span>
      )}
    </SelectItem>
  );
}

export function AccountSelect() {
  const [open, setOpen] = useState(false);
  const { connector } = useAccount();
  const { connect } = useConnect();
  const { openConnectModal } = useConnectModal();
  const configuredConnectors = useConnectors();
  const connectors = [...configuredConnectors.filter((connector) => connector.type === "anvil")];

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={connector?.id}
      onValueChange={(connectorId: string) => {
        const connector = connectors.find((connector) => connector.id === connectorId);
        if (connector) {
          connect({ connector });
        }
      }}
    >
      <StyledConnectButton asChild>
        <SelectTrigger showIcon={false}>
          <PlugIcon className="mr-2 inline-block h-4 w-4" />
          <SelectValue placeholder="Connect" />
        </SelectTrigger>
      </StyledConnectButton>

      <SelectContent>
        {connectors.map((connector) => {
          return <AccountSelectItem key={connector.id} connector={connector} />;
        })}

        <StyledConnectButton
          className="mt-2 w-full font-mono"
          onClick={() => {
            setOpen(false);
            openConnectModal?.();
          }}
        >
          <CirclePlusIcon className="mr-2 inline-block h-4 w-4" />
          Add wallet
        </StyledConnectButton>
      </SelectContent>
    </Select>
  );
}
