import { useState } from "react";
import { useChains, useChainId } from "wagmi";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { DepositViaNativeForm } from "./DepositViaNativeForm";
import { DepositViaRelayForm } from "./DepositViaRelayForm";
import { DepositMethod } from "../ConnectedSteps";

type Props = {
  depositMethod: DepositMethod;
  goBack: () => void;
};

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

// TODO: add goBack
export function DepositFormContainer({ depositMethod, goBack }: Props) {
  const { chainId: destinationChainId } = useEntryKitConfig();
  const chainId = useChainId();
  const chains = useChains();
  const [amount, setAmount] = useState<bigint | undefined>(undefined);
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;

  return (
    <div className="pt-8 pb-4">
      {destinationChainId === sourceChainId ? (
        <DepositViaNativeForm
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
    </div>
  );
}
