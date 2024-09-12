import { PlugIcon, ZapIcon } from "lucide-react";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { isAnvil } from "../common";
import { cn } from "../lib/utils";
import { AccountSelect } from "./AccountSelect";
import { Button } from "./ui/Button";

export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

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
                  <Button type="button" size="sm" onClick={openConnectModal}>
                    <PlugIcon className="mr-2 inline-block h-4 w-4" /> Connect
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button type="button" size="sm" onClick={openChainModal}>
                    <ZapIcon className="mr-2 inline-block h-4 w-4" />
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={openAccountModal} variant="secondary">
                    <PlugIcon className="mr-2 inline-block h-4 w-4" />
                    {account.displayName}
                    <span className="ml-2 font-normal opacity-70">
                      {account.displayBalance ? ` (${account.displayBalance})` : ""}
                    </span>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
