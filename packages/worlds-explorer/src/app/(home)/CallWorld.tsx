"use client";

import { useStore } from "@/store";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { wagmiConfig } from "../_providers";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { useWorldAddress } from "@/hooks/useWorldAddress";

export const abi = [
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
  {
    type: "function",
    name: "setRecord",
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
        name: "staticData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
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
  const worldAddress = useWorldAddress();

  async function callWorld() {
    const toastId = toast.loading("Transaction submitted");

    // concatHex([staticData, encodedLengths, dynamicData]);

    // function setRecord(
    //   ResourceId tableId,
    //   bytes32[] memory keyTuple,
    //   bytes memory staticData,
    //   EncodedLengths encodedLengths,
    //   bytes memory dynamicData
    // ) internal;

    const encodedValueArgs = encodeValueArgs(
      { createdAt: "uint256", completedAt: "uint256", description: "string" },
      {
        createdAt: BigInt(0),
        completedAt: BigInt(12323),
        description: "Check",
      },
    );

    console.log("encodeValueArgs:");
    console.log(encodedValueArgs.staticData, encodedValueArgs.encodedLengths, encodedValueArgs.dynamicData);

    try {
      // TODO: set tasks
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi,
        address: worldAddress,
        functionName: "setRecord",
        args: [
          "0x746261707000000000000000000000005461736b730000000000000000000000",
          ["0x0c9151148be227a42be8d3e3e7e61da28a532f2340b0ad9ca8bc747703ec2417"],
          encodedValueArgs.staticData,
          encodedValueArgs.encodedLengths,
          encodedValueArgs.dynamicData,
        ],
      });

      // TODO: works for editing singleton, nice
      // const txHash = await writeContractAsync({
      //   account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
      //   abi,
      //   address: worldAddress,
      //   functionName: "setField",
      //   args: ["0x74626170700000000000000000000000436f756e746572000000000000000000", [], 0, "0x00000012"],
      // });

      // const txHash = await writeContractAsync({
      //   account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
      //   abi,
      //   address: worldAddress,
      //   functionName: "setField",
      //   args: [
      //     "0x74626170700000000000000000000000436865636b6564000000000000000000",
      //     ["0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace"],
      //     0,
      //     "0x0100000000000000000000000000000000000000000000000000000000000000",
      //   ],
      // });

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
