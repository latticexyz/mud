"use client";

import { useStore } from "@/store";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "../_providers";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { Hex } from "viem";

const abi = [
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

export function CallWorld() {
  const { account } = useStore();
  const { writeContractAsync } = useWriteContract();

  async function callWorld() {
    const toastId = toast.loading("Transaction submitted");

    try {
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi,
        address: process.env.NEXT_PUBLIC_WORLD_ADDRESS as Hex,
        functionName: "setField",
        args: ["0x74626170700000000000000000000000436f756e746572000000000000000000", [], 0, "0x00000012"],
      });

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
      });

      toast.success(`Transaction successful with hash: ${txHash}`, {
        id: toastId,
      });

      console.log("result:", txHash, transactionReceipt);
    } catch (error) {
      console.log("error:", error);

      toast.error("Uh oh! Something went wrong.", {
        id: toastId,
      });
    }
  }

  return (
    <div>
      <button onClick={callWorld}>Call world</button>
    </div>
  );
}
