import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { useAppAccountClient } from "../../useAppAccountClient";
import { useAppChain } from "../../useAppChain";
import { GasBalanceSection } from "./GasBalanceSection";
import { useSwitchChain, useAccount } from "wagmi";
import { Button } from "../../ui/Button";

export function DepositManualContent() {
  const appChain = useAppChain();
  const { data: appAccountClient } = useAppAccountClient();
  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = userChainId !== appChain.id;
  const switchChain = useSwitchChain();

  return (
    <>
      <AccountModalTitle title="Gas balance" />
      <GasBalanceSection />
      <AccountModalSection>
        <div className="flex flex-col p-5 gap-5">
          <p>
            Top up your gas balance by sending funds to your app account. Prepaid gas lets you interact with this app
            without wallet popups.
          </p>

          {shouldSwitchChain ? (
            <Button
              type="button"
              className="w-full"
              pending={switchChain.isPending}
              onClick={() => switchChain.switchChainAsync({ chainId: appChain.id })}
            >
              Switch chain
            </Button>
          ) : (
            <p className="p-4 font-medium bg-white border flex flex-col gap-1">
              <span className="text-xs uppercase font-medium text-neutral-500">App account address</span>
              <code className="text-sm font-mono">{appAccountClient?.account.address}</code>
            </p>
          )}
        </div>
      </AccountModalSection>
    </>
  );
}
