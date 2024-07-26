import { waitForTransactionReceipt } from "@wagmi/core";
import { encodeField, encodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { privateKeyToAccount } from "viem/accounts";
import { useWriteContract } from "wagmi";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { useWorldAddress } from "@/hooks/useWorldAddress";
import { useStore } from "@/store";
import { wagmiConfig } from "../_providers";
import { abi } from "./abi";
import { parseEventLogs } from "viem";

type Props = {
  name: string;
  value: string;
  values: Record<string, string>;
  keyTuple: [string];
  config: Record<string, string>;
};

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function setDynamicField(config, writeContractAsync, worldAddress, account, keyTuple) {
  const encodedValueArgs = encodeValueArgs(
    {
      createdAt: "uint256",
      completedAt: "uint256",
      description: "string",
    },
    {
      completedAt: BigInt(1),
      createdAt: BigInt(10),
      description: "Desc",
    },
  );

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

  return txHash;
}

export function EditableTableCell({ config, keyTuple, value: defaultValue }: Props) {
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
      const dynamic = false;
      let txHash;

      if (dynamic) {
        txHash = await setDynamicField(config, writeContractAsync, worldAddress, account, keyTuple);
      } else {
        const tableId = config.table_id;
        const fieldType = config.value_schema.value;

        txHash = await writeContractAsync({
          account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
          abi,
          address: worldAddress,
          functionName: "setField",
          args: [tableId, keyTuple, 0, encodeField(fieldType, value)],
        });
      }

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
      });

      const logs = parseEventLogs({
        abi: abi,
        logs: transactionReceipt.logs,
      });
      console.log("logs:", logs);

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
