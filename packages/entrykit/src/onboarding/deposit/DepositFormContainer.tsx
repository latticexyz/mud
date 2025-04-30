import { useState } from "react";
import { useChains, useChainId } from "wagmi";
import { DepositViaNativeForm } from "./DepositViaNativeForm";
import { DepositViaRelayForm } from "./DepositViaRelayForm";
import { DepositMethod } from "../ConnectedSteps";

type Props = {
  depositMethod: DepositMethod;
  goBack: () => void;
};

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
// TODO: move to configs
export const BALANCE_SYSTEM_ABI = [
  {
    type: "function",
    name: "balances",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositTo",
    inputs: [
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "error",
    name: "BalanceTooHigh",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "newBalance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxBalance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
];

// TODO: add goBack
export function DepositFormContainer({ depositMethod, goBack }: Props) {
  const chainId = useChainId();
  const chains = useChains();
  const [amount, setAmount] = useState<bigint | undefined>(undefined);
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;

  return (
    <div className="pt-8 pb-4">
      {/* {depositMethod === "gasBalance" && ( */}
      <DepositViaNativeForm
        amount={amount}
        setAmount={setAmount}
        sourceChain={sourceChain}
        setSourceChainId={setSourceChainId}
      />
      {/* // )} */}

      {/* {depositMethod === "allowance" && (
        <DepositViaRelayForm
          amount={amount}
          setAmount={setAmount}
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
        />
      )} */}
    </div>
  );
}
