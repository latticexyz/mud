import { PlugIcon, ZapIcon } from "lucide-react";
import { anvil } from "viem/chains";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "../../lib/utils";
import { Button, ButtonProps } from "../ui/Button";
import { SelectValue } from "../ui/Select";
import { AccountSelect } from "./AccountSelect";

export function StyledConnectButton({ children, ...props }: ButtonProps) {
  return (
    <Button type="button" size="sm" {...props}>
      {children}
    </Button>
  );
}

export function ConnectButton() {
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
                  return <AccountSelect />;
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
