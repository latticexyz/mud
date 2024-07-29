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
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  name: string;
  value: string;
  values: Record<string, string>;
  keyTuple: [string];
  config: Record<string, string>;
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

  const tableId = config?.table_id;
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

export function EditableTableCell({ name, config, keyTuple, value: defaultValue }: Props) {
  const { account } = useStore();
  const { writeContractAsync } = useWriteContract();
  const worldAddress = useWorldAddress();
  const [value, setValue] = useState(defaultValue);

  const isRecord = false; // TODO: determine properly
  const tableId = config?.table_id;
  const fieldType = config?.value_schema[name];

  const handleSubmit = async (newValue: unknown) => {
    const toastId = toast.loading("Transaction submitted");

    const valueToSet = newValue === undefined ? value : newValue;
    if (newValue !== undefined) {
      setValue(newValue);
    }

    try {
      let txHash;

      if (isRecord) {
        txHash = await setDynamicField(config, writeContractAsync, worldAddress, account, keyTuple);
      } else {
        txHash = await writeContractAsync({
          account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
          abi,
          address: worldAddress,
          functionName: "setField",
          args: [tableId, keyTuple, 0, encodeField(fieldType, valueToSet)],
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

  if (fieldType === "bool") {
    return (
      <Checkbox
        id="show-all-columns"
        checked={value === "1"}
        onCheckedChange={async () => {
          const newValue = value === "1" ? "0" : "1";
          handleSubmit(newValue);
        }}
      />
    );
  }

  return (
    <input
      className="bg-transparent w-full"
      onChange={(evt: ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value;
        setValue(value);
      }}
      onBlur={() => {
        handleSubmit(value);
      }}
      defaultValue={value}
    />
  );
}
