import { useState } from "react";
import { useChains, useChainId } from "wagmi";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { DepositViaTransferForm } from "./DepositViaTransferForm";
import { DepositViaRelayForm } from "./DepositViaRelayForm";
import { Deposits } from "./Deposits";

export function DepositFormContainer() {
  const { chainId: destinationChainId } = useEntryKitConfig();
  const chainId = useChainId();
  const chains = useChains();
  const [amount, setAmount] = useState<bigint | undefined>(undefined);
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;

  return (
    <div className="pt-10 pb-2">
      {destinationChainId === sourceChainId ? (
        <DepositViaTransferForm
          amount={amount}
          setAmount={setAmount}
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
        />
      ) : (
        <DepositViaRelayForm
          amount={amount}
          setAmount={setAmount}
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
        />
      )}

      <Deposits />
    </div>
  );
}
