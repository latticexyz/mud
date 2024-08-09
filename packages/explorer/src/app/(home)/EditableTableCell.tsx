import { Loader } from "lucide-react";
import { toast } from "sonner";
import { privateKeyToAccount } from "viem/accounts";
import { useChainId, useWriteContract } from "wagmi";
import { ChangeEvent, useState } from "react";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType } from "@latticexyz/schema-type/internal";
import { useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Checkbox } from "../../components/ui/Checkbox";
import { ACCOUNT_PRIVATE_KEYS } from "../../consts";
import { useWorldAddress } from "../../hooks/useWorldAddress";
import { camelCase } from "../../lib/utils";
import { useStore } from "../../store";
import { wagmiConfig } from "../_providers";
import { TableConfig } from "../api/table/route";
import { abi } from "./abi";
import { getFieldIdx } from "./utils/getFieldIdx";

type Props = {
  name: string;
  value: string;
  keyTuple: string[];
  config: TableConfig;
};

export function EditableTableCell({
  name,
  config,
  keyTuple,
  value: defaultValue,
}: Props) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { account } = useStore();
  const { writeContractAsync } = useWriteContract();
  const worldAddress = useWorldAddress();

  const [loading, setLoading] = useState(false);
  const [prevValue, setPrevValue] = useState<unknown>(defaultValue);
  const [value, setValue] = useState<unknown>(defaultValue);

  const tableId = config?.table_id;
  const fieldType = config?.value_schema[camelCase(name)] as SchemaAbiType;

  const handleSubmit = async (newValue: unknown) => {
    const valueToSet = newValue === undefined ? value : newValue;
    if (newValue !== undefined) {
      setValue(newValue);
    }

    if (valueToSet === prevValue) {
      return;
    }

    setPrevValue(valueToSet);
    setLoading(true);

    const toastId = toast.loading("Transaction submitted");
    try {
      const fieldIdx = getFieldIdx(config?.value_schema, camelCase(name));
      const encodedField = encodeField(fieldType, valueToSet);
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi,
        address: worldAddress,
        functionName: "setField",
        args: [tableId, keyTuple, fieldIdx, encodedField],
      });

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        pollingInterval: 100,
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
    } finally {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: [
          "balance",
          {
            address: account,
            chainId,
          },
        ],
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

  if (loading) {
    return (
      <div className="flex cursor-wait items-center gap-1">
        {String(value)} <Loader className="h-4 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={() => {
        handleSubmit(value);
      }}
    >
      <input
        className="w-full bg-transparent"
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          const value = evt.target.value;
          setValue(value);
        }}
        onFocus={() => {
          setPrevValue(value);
        }}
        onBlur={() => {
          handleSubmit(value);
        }}
        defaultValue={String(value)}
      />
    </form>
  );
}
