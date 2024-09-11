import { CirclePlusIcon, PlugIcon, ZapIcon } from "lucide-react";
import { Address } from "viem";
import { anvil } from "viem/chains";
import { Connector, useAccount, useBalance, useConnect, useConnectors } from "wagmi";
import { useEffect, useState } from "react";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "../lib/utils";
import { formatBalance } from "../lib/utils";
import { Button, ButtonProps } from "./ui/Button";
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

function StyledConnectButton({ children, ...props }: ButtonProps) {
  return (
    <Button type="button" size="sm" {...props}>
      {children}
    </Button>
  );
}

export function ConnectButton() {
  const { connector } = useAccount();
  const { connect } = useConnect();
  const configuredConnectors = useConnectors();
  const connectors = [...configuredConnectors.filter((connector) => connector.type === "anvil")];

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const isAnvil = Number(process.env.NEXT_PUBLIC_CHAIN_ID) === anvil.id;

        return (
          <div
            className={cn({
              "pointer-events-none select-none opacity-0": !mounted,
            })}
          >
            {(() => {
              if (!connected) {
                if (isAnvil) {
                  return (
                    <Select
                      value={connector?.id}
                      onValueChange={(connectorId) => {
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

                        <StyledConnectButton onClick={openConnectModal} className="mt-2 w-full font-mono">
                          <CirclePlusIcon className="mr-2 inline-block h-4 w-4" />
                          Add wallet
                        </StyledConnectButton>
                      </SelectContent>
                    </Select>
                  );
                }

                return (
                  <StyledConnectButton onClick={openConnectModal}>
                    <PlugIcon className="mr-2 inline-block h-4 w-4" />
                    <SelectValue placeholder="Connect" />
                  </StyledConnectButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <StyledConnectButton onClick={openChainModal}>
                    <ZapIcon className="mr-2 inline-block h-4 w-4" />
                    Wrong network
                  </StyledConnectButton>
                );
              }

              return (
                <div className="flex-wrap gap-2">
                  <StyledConnectButton onClick={openAccountModal} variant="secondary">
                    <PlugIcon className="mr-2 inline-block h-4 w-4" />
                    {account.displayName}
                    <span className="ml-2 font-normal opacity-70">
                      {account.displayBalance ? ` (${account.displayBalance})` : ""}
                    </span>
                  </StyledConnectButton>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
