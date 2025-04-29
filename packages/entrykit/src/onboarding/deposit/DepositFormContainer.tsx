import { useState } from "react";
import { useChains, useChainId, useWalletClient, useAccount } from "wagmi";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Execute } from "@reservoir0x/relay-sdk";
import { SubmitButton } from "./SubmitButton";
import { DepositForm } from "./DepositForm";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { useRelay } from "./useRelay";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { pyrope } from "@latticexyz/common/chains";
import { DepositViaRelayForm } from "./DepositViaRelayForm";
import { DepositViaNativeForm } from "./DepositViaNativeForm";

type Props = {
  goBack: () => void;
};

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
// TODO: move to configs
export const BALANCE_SYSTEM_ADDRESS = "0x01B0d1C240524FC52Ba233Ae509723c79b17A4d3";
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

// TODO: remove use of publicClient
export const publicClient = createPublicClient({
  chain: pyrope,
  transport: http(),
});

// TODO: add goBack
export function DepositFormContainer({ goBack }: Props) {
  const chainId = useChainId();
  const chains = useChains();
  const { chainId: destinationChainId } = useEntryKitConfig();
  const [amount, setAmount] = useState<bigint | undefined>(undefined);
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;

  return (
    <div className="pt-8 pb-4">
      {sourceChainId === destinationChainId ? (
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
