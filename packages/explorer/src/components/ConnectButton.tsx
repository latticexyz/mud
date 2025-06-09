import { PlugIcon, ZapIcon } from "lucide-react";
import { anvil } from "viem/chains";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useChain } from "../app/(explorer)/hooks/useChain";
import { useENS } from "../app/(explorer)/hooks/useENS";
import { cn } from "../utils";
import { AccountSelect } from "./AccountSelect";
import { Button } from "./ui/Button";

type ConnectedButtonProps = {
  address: string;
  balance: string | undefined;
  openAccountModal: () => void;
};

function ConnectedButton({ address, balance, openAccountModal }: ConnectedButtonProps) {
  const { data: ensData } = useENS(address);
  return (
    <div className="flex-wrap gap-2">
      <Button type="button" size="sm" onClick={openAccountModal} variant="secondary">
        <PlugIcon className="mr-2 inline-block h-4 w-4" />
        {ensData?.displayName}
        <span className="ml-2 font-normal opacity-70">{balance ? ` (${balance})` : ""}</span>
      </Button>
    </div>
  );
}

export function ConnectButton() {
  const { id: chainId } = useChain();
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
                if (chainId === anvil.id) {
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
                <ConnectedButton
                  address={account.address}
                  balance={account.displayBalance}
                  openAccountModal={openAccountModal}
                />
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
