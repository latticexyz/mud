import { CircleMinusIcon, CirclePlusIcon } from "lucide-react";
import { Address, formatEther } from "viem";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ACCOUNTS } from "../consts";
import { usePrevious } from "../hooks/usePrevious";
import { useAppStore } from "../store";
import { Button } from "./ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { TruncatedHex } from "./ui/TruncatedHex";

function AccountSelectItem({ address, name }: { address: Address; name: string }) {
  const balance = useBalance({
    address,
    query: {
      refetchInterval: 15000,
    },
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  });
  const balanceValue = balance.data?.value;
  return (
    <SelectItem key={address} value={address} className="font-mono">
      {name}
      {balanceValue !== undefined && ` (${formatEther(balanceValue)} ETH)`}{" "}
      <span className="opacity-70">
        (<TruncatedHex hex={address} />)
      </span>
    </SelectItem>
  );
}

export function AccountSelect() {
  const [open, setOpen] = useState(false);
  const { isConnected, address: connectedAddress } = useAccount();
  const previousIsConnected = usePrevious(isConnected);
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { account, setAccount } = useAppStore();
  const accounts = [...ACCOUNTS, connectedAddress as Address].filter(Boolean);

  useEffect(() => {
    if (!previousIsConnected && isConnected && account !== connectedAddress) {
      setAccount(connectedAddress as Address);
    }
  }, [isConnected, connectedAddress, setAccount, account, previousIsConnected]);

  return (
    <Select value={account} onValueChange={setAccount} open={open} onOpenChange={setOpen}>
      <SelectTrigger className="text-left" onClick={() => setOpen(true)}>
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent className="max-h-[500px]">
        {accounts.map((address, index) => {
          const name = address === connectedAddress ? "Connected wallet" : `Test account ${index + 1}`;
          return <AccountSelectItem key={address} address={address} name={name} />;
        })}

        {isConnected && (
          <Button
            variant="default"
            size="sm"
            className="mt-2 w-full font-mono"
            onClick={() => {
              disconnect();
              setAccount(accounts[0] as Address);
              setOpen(false);
            }}
          >
            <CircleMinusIcon className="mr-2 inline-block h-4 w-4" /> Disconnect wallet
          </Button>
        )}

        {!isConnected && openConnectModal && (
          <Button
            variant="default"
            size="sm"
            className="mt-2 w-full font-mono"
            onClick={() => {
              setOpen(false);
              openConnectModal();
            }}
          >
            <CirclePlusIcon className="mr-2 inline-block h-4 w-4" /> Connect wallet
          </Button>
        )}
      </SelectContent>
    </Select>
  );
}
