import { useState } from "react";
import { useChains, useChainId, useWalletClient, useAccount } from "wagmi";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { useMutation, useQuery } from "wagmi/query";
import { Execute } from "@reservoir0x/relay-sdk";
import { SubmitButton } from "./SubmitButton";
import { DepositForm } from "./DepositForm";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { useRelay } from "./useRelay";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { pyrope } from "@latticexyz/common/chains";

type Props = {
  goBack: () => void;
};

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const BALANCE_SYSTEM_ADDRESS = "0x01B0d1C240524FC52Ba233Ae509723c79b17A4d3";
const BALANCE_SYSTEM_ABI = [
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

export const publicClient = createPublicClient({
  chain: pyrope,
  transport: http(),
});

export function DepositFormContainer({ goBack }: Props) {
  const chainId = useChainId();
  const chains = useChains();
  const { address: userAddress } = useAccount();
  const { chainId: destinationChainId } = useEntryKitConfig();
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;
  const [amount, setAmount] = useState<bigint | undefined>(undefined);

  const { data: wallet } = useWalletClient();
  const { data: relay } = useRelay();
  const relayClient = relay?.client;

  console.log("amount", amount);

  const quote = useQuery({
    queryKey: ["relayBridgeQuote", sourceChain.id, amount?.toString()],
    retry: 1,
    queryFn: async () => {
      const balance = await publicClient.readContract({
        address: BALANCE_SYSTEM_ADDRESS,
        abi: BALANCE_SYSTEM_ABI,
        functionName: "balances",
        args: [userAddress],
      });
      console.log("balance", balance);

      const result = await relayClient?.actions.getQuote({
        chainId: sourceChain.id,
        toChainId: destinationChainId,
        currency: ETH_ADDRESS,
        toCurrency: ETH_ADDRESS,
        amount: amount?.toString(), // 1000000000000000
        tradeType: "EXACT_OUTPUT",
        recipient: BALANCE_SYSTEM_ADDRESS,
        wallet,
        txs: [
          {
            to: BALANCE_SYSTEM_ADDRESS,
            data: encodeFunctionData({
              abi: BALANCE_SYSTEM_ABI,
              functionName: "depositTo",
              args: [userAddress],
            }),
            value: amount?.toString(),
          },
        ],
      });

      if (!result) {
        throw new Error("Failed to get relay quote");
      }

      return result as Execute;
    },
    refetchInterval: 15000,
    enabled: !!amount && !!wallet?.account.address,
  });

  const deposit = useMutation({
    mutationKey: ["relayBridge"],
    mutationFn: async (quote: Execute) => {
      try {
        const result = await relayClient?.actions.execute({
          quote,
          wallet: wallet!,
          onProgress: ({ steps, fees, breakdown, currentStep, currentStepItem, txHashes, details }) => {
            console.log("onProgress", { steps, fees, breakdown, currentStep, currentStepItem, txHashes, details });
          },
        });

        return result;
      } catch (error) {
        console.error("Error while depositing via Relay", error);
        throw error;
      }
    },
  });

  console.log("quote", quote.data);

  const fee = quote.data?.fees?.gas?.amount;
  return (
    <>
      <span className="p-1 cursor-pointer" onClick={goBack} aria-label="Back">
        <ArrowLeftIcon className="w-4 h-4" />
      </span>

      <div className="py-6">
        <DepositForm
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
          amount={amount}
          setAmount={setAmount}
          estimatedFee={{
            fee: fee != null ? BigInt(fee) : undefined,
            isLoading: quote.isLoading,
            error: quote.error instanceof Error ? quote.error : undefined,
          }}
          estimatedTime="A few seconds"
          onSubmit={async () => {
            if (!quote.data) return;
            await deposit.mutateAsync(quote.data);
          }}
          submitButton={
            <SubmitButton
              variant="primary"
              chainId={sourceChain.id}
              disabled={quote.isError || !amount}
              pending={deposit.isPending}
            >
              Deposit
            </SubmitButton>
          }
        />
      </div>
    </>
  );
}
