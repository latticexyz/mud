import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { DepositViaTransferForm } from "./via-transfer/DepositViaTransferForm";
import { useAppChain } from "../../useAppChain";
import { GasBalanceSection } from "./GasBalanceSection";
import { useState } from "react";

export function DepositContent() {
  const chain = useAppChain();
  const [sourceChainId, setSourceChainId] = useState(chain.id);
  const [amount, setAmount] = useState<bigint | undefined>();

  return (
    <>
      <AccountModalTitle title="Deposit" />

      <GasBalanceSection />

      <AccountModalSection>
        <div className="flex flex-col py-5 gap-5">
          <p className="px-5">
            Top up your gas balance from your chain of choice. Prepaid gas lets you interact with this app without
            wallet popups.
          </p>
          <DepositViaTransferForm
            sourceChainId={sourceChainId}
            setSourceChainId={setSourceChainId}
            amount={amount}
            setAmount={setAmount}
          />
        </div>
      </AccountModalSection>
    </>
  );
}
