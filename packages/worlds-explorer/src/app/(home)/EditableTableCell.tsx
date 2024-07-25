import { waitForTransactionReceipt } from "@wagmi/core";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { useWorldAddress } from "@/hooks/useWorldAddress";
import { useStore } from "@/store";
import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { ChangeEvent, useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { useWriteContract } from "wagmi";
import { wagmiConfig } from "../_providers";
import { toast } from "sonner";

type Props = {
  value: string;
  config: Record<string, string>;
};

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

export function EditableTableCell({ value: defaultValue }: Props) {
  const { account } = useStore();
  const { writeContractAsync } = useWriteContract();
  const worldAddress = useWorldAddress();
  const [value, setValue] = useState(defaultValue);

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setValue(value);
  };

  const handleSubmit = async () => {
    const toastId = toast.loading("Transaction submitted");

    try {
      const encodedValueArgs = encodeValueArgs(
        { createdAt: "uint256", completedAt: "uint256", description: "string" },
        {
          createdAt: BigInt(0),
          completedAt: BigInt(12323),
          description: "Check 12",
        },
      );

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
  };

  return <input className="bg-transparent w-full" onChange={handleChange} onBlur={handleSubmit} defaultValue={value} />;
}
