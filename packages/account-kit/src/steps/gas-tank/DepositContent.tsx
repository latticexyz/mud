import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { DirectDepositContent } from "./DirectDepositContent";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasTankStateContent } from "./GasTankStateContent";
import { ChainSelect } from "./components/ChainSelect";
import { AmountInput } from "./components/AmountInput";
import { BalancesFees } from "./components/BalancesFees";
import { Button } from "../../ui/Button";

type DepositMethod = "direct" | "bridge" | "relay" | null;

export function DepositContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;
  const [depositMethod, setDepositMethod] = useState<DepositMethod>();
  const [depositAmount, setDepositAmount] = useState<string>("");

  useEffect(() => {
    if (!depositMethod) {
      if (chain.id === userAccountChainId) {
        setDepositMethod("direct");
      } else if (chain.sourceId === userAccountChainId) {
        setDepositMethod("bridge");
      } else {
        setDepositMethod("relay");
      }
    }
  }, [chain.id, chain.sourceId, userAccountChainId, depositMethod]);

  return (
    <>
      <AccountModalTitle title="Gas tank" />

      <AccountModalSection>
        <GasTankStateContent amount={depositAmount} />
      </AccountModalSection>

      <AccountModalSection>
        <div className="flex flex-col gap-2 p-5">
          <p className="pb-2">
            Add funds from your wallet to your tank to fund transactions for any MUD apps on Chain Name.
          </p>

          <div className="flex gap-[12px]">
            <ChainSelect />
            <AmountInput amount={depositAmount} setAmount={setDepositAmount} />
          </div>

          <BalancesFees />

          {chain.id === userAccountChainId && <DirectDepositContent amount={depositAmount} />}
          {chain.sourceId === userAccountChainId && (
            <StandardBridgeContent amount={depositAmount} sourceChainId={userAccountChainId!} />
          )}
          {chain.id !== userAccountChainId && chain.sourceId !== userAccountChainId && (
            <RelayLinkContent amount={depositAmount} sourceChainId={userAccountChainId!} />
          )}

          {/* pending={!userAccountAddress || isPending} onClick={handleDeposit} */}
          <Button className="w-full">Deposit</Button>
        </div>
      </AccountModalSection>
    </>
  );
}
