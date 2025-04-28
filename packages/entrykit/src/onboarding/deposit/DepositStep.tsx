// import { AccountModalTitle } from "../../AccoutModalTitle";
// import { AccountModalSection } from "../../AccountModalSection";
// import { GasBalanceSection } from "./GasBalanceSection";
import { useState } from "react";
import { useSourceChains } from "./useSourceChains";
// import { useConfig } from "../../AccountKitConfigProvider";
import { useDebounceValue } from "usehooks-ts";
import { Deposits } from "./Deposits";
import { DepositViaRelayForm } from "./DepositViaRelayForm";

export function DepositStep() {
  // const { chainId: appChainId } = useConfig(); // TODO: fetch dynamically
  const appChainId = 31337;
  const [sourceChainId, setSourceChainId] = useState(appChainId);
  const [amount, setAmount] = useDebounceValue<bigint | undefined>(undefined, 200);

  const sourceChains = useSourceChains();
  const sourceChain = sourceChains.find((c) => c.id === sourceChainId) ?? sourceChains.find((c) => c.id === appChainId);

  // TODO: do we need a better error here or can we just guarantee this data in some way?
  if (!sourceChain) {
    throw new Error(`Expected a source chain, but could not find one. Is Wagmi configured with chain ${appChainId}?`);
  }

  return (
    <>
      {/* <AccountModalTitle title="Top up" /> */}
      {/* <GasBalanceSection /> */}
      {/* <AccountModalSection> */}

      <div className="flex flex-col py-5 gap-5">
        <p className="px-5">Every onchain interaction uses gas. Top up your gas balance with funds from any chain.</p>
        <DepositViaRelayForm
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
          amount={amount}
          setAmount={setAmount}
        />

        <Deposits />
      </div>

      {/* </AccountModalSection> */}
    </>
  );
}
