import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasBalanceSection } from "./GasBalanceSection";
import { useState } from "react";
import { DepositMethod } from "./common";
import { useSourceChains } from "./useSourceChains";
import { useConfig } from "../../AccountKitConfigProvider";
import { DepositMethodForm } from "./DepositMethodForm";
import { useDepositTransactions } from "./useDepoitTransactions";
import { BridgeTransactionStatus } from "./BridgeTransactionStatus";
import { assertExhaustive } from "@latticexyz/common/utils";

export function DepositContent() {
  const { chainId: appChainId } = useConfig();
  const [sourceChainId, setSourceChainId] = useState(appChainId);
  const [amount, setAmount] = useState<bigint | undefined>();
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<DepositMethod>("transfer");

  const sourceChains = useSourceChains();
  const sourceChain = sourceChains.find((c) => c.id === sourceChainId) ?? sourceChains.find((c) => c.id === appChainId);

  // TODO: do we need a better error here or can we just guarantee this data in some way?
  if (!sourceChain) {
    throw new Error(`Expected a source chain, but could not find one. Is Wagmi configured with chain ${appChainId}?`);
  }

  const depositMethod = sourceChain.depositMethods.includes(selectedDepositMethod)
    ? selectedDepositMethod
    : sourceChain.depositMethods[0];

  const { transactions } = useDepositTransactions();

  return (
    <>
      <AccountModalTitle title="Gas balance" />

      <GasBalanceSection />

      <AccountModalSection>
        <div className="flex flex-col py-5 gap-5">
          <p className="px-5">
            Top up your gas balance from your chain of choice. Prepaid gas lets you interact with this app without
            wallet popups.
          </p>
          <DepositMethodForm
            sourceChain={sourceChain}
            setSourceChainId={setSourceChainId}
            amount={amount}
            setAmount={setAmount}
            depositMethod={depositMethod}
            setDepositMethod={setSelectedDepositMethod}
          />
          {/* TODO: make transactions dismissable */}
          {transactions.length > 0 ? (
            <div className="flex flex-col gap-1 px-5">
              {transactions.map((transaction) => {
                switch (transaction.type) {
                  case "bridge":
                    return <BridgeTransactionStatus key={transaction.uid} {...transaction} />;
                  default:
                    assertExhaustive(transaction.type);
                }
              })}
            </div>
          ) : null}
        </div>
      </AccountModalSection>
    </>
  );
}
