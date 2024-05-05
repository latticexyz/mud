import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasBalanceSection } from "./GasBalanceSection";
import { useState } from "react";
import { DepositMethod } from "./common";
import { useSourceChains } from "./useSourceChains";
import { useConfig } from "../../AccountKitConfigProvider";
import { DepositMethodForm } from "./DepositMethodForm";
import { useDeposits } from "./useDeposits";
import { BridgeDepositStatus } from "./BridgeDepositStatus";
import { assertExhaustive } from "@latticexyz/common/utils";
import { RelayDepositStatus } from "./RelayDepositStatus";
import { useDebounceValue } from "usehooks-ts";
import { TransferDepositStatus } from "./TransferDepositStatus";

export function DepositStep() {
  const { chainId: appChainId } = useConfig();
  const [sourceChainId, setSourceChainId] = useState(appChainId);
  const [amount, setAmount] = useDebounceValue<bigint | undefined>(undefined, 200);
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

  const { deposits, removeDeposit } = useDeposits();

  return (
    <>
      <AccountModalTitle title="Top up" />

      <GasBalanceSection />

      <AccountModalSection>
        <div className="flex flex-col py-5 gap-5">
          <p className="px-5">Every onchain interaction uses gas. Top up your gas balance with funds from any chain.</p>
          <DepositMethodForm
            sourceChain={sourceChain}
            setSourceChainId={setSourceChainId}
            amount={amount}
            setAmount={setAmount}
            depositMethod={depositMethod}
            setDepositMethod={setSelectedDepositMethod}
          />
          {/* TODO: make deposits dismissable */}
          {deposits.length > 0 ? (
            <div className="flex flex-col gap-1 px-5">
              {deposits.map((deposit) => {
                switch (deposit.type) {
                  case "transfer":
                    return (
                      <TransferDepositStatus
                        key={deposit.uid}
                        {...deposit}
                        onDismiss={() => removeDeposit(deposit.uid)}
                      />
                    );
                  case "bridge":
                    return (
                      <BridgeDepositStatus
                        key={deposit.uid}
                        {...deposit}
                        onDismiss={() => removeDeposit(deposit.uid)}
                      />
                    );
                  case "relay":
                    return (
                      <RelayDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />
                    );
                  default:
                    // TODO: wtf TS y u no narrow
                    assertExhaustive(deposit.type);
                }
              })}
            </div>
          ) : null}
        </div>
      </AccountModalSection>
    </>
  );
}
