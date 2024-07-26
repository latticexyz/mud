import { waitForTransactionReceipt } from "@wagmi/core";
import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { privateKeyToAccount } from "viem/accounts";
import { useWriteContract } from "wagmi";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { useWorldAddress } from "@/hooks/useWorldAddress";
import { useStore } from "@/store";
import { wagmiConfig } from "../_providers";
import { abi } from "./abi";

type Props = {
  name: string;
  value: string;
  values: Record<string, string>;
  keyTuple: [string];
  config: Record<string, string>;
};

export function EditableTableCell({ name, config, keyTuple, values, value: defaultValue }: Props) {
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

    console.log("name:", name);
    console.log("config:", config.value_schema);
    console.log("new value:", value);
    console.log("values:", values);

    console.log("new values:", {
      // createdAt: BigInt(0),
      // completedAt: BigInt(12323),
      // description: "Check 12123",

      ...values,
      [name]: value,
    });

    try {
      console.log(config.value_schema);

      const encodedValueArgs = encodeValueArgs(
        {
          createdAt: "uint256",
          completedAt: "uint256",
          description: "string",
        },
        {
          completedAt: BigInt(1),
          createdAt: BigInt(2),
          description: "Desc",
        },
      );

      console.log("encodedValueArgs:", encodedValueArgs);

      // TODO: set tasks
      const tableId = config.table_id;
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi,
        address: worldAddress,
        functionName: "setRecord",
        args: [
          tableId,
          keyTuple,
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
