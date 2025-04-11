import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { ChangeEvent, memo, useEffect, useState } from "react";
import { Table } from "@latticexyz/config";
import {
  ValueSchema,
  encodeField,
  getFieldIndex,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "../../../../../../components/ui/Checkbox";
import { cn } from "../../../../../../utils";
import { useChain } from "../../../../hooks/useChain";

type Props = {
  name: string;
  value: unknown;
  table: Table;
  keyTuple: readonly Hex[];
};

function EditableTableCellInner({ name, table, keyTuple, value: defaultValue }: Props) {
  const [value, setValue] = useState<unknown>(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState<string>(String(defaultValue));
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const account = useAccount();

  // Update local value when default changes and not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(String(defaultValue));
      setValue(defaultValue);
    }
  }, [defaultValue, isFocused]);

  const valueSchema = getValueSchema(table);
  const fieldType = valueSchema?.[name as never]?.type;

  const { mutate, isPending } = useMutation({
    mutationFn: async (newValue: unknown) => {
      if (!fieldType) throw new Error("Field type not found");

      const fieldIndex = getFieldIndex<ValueSchema>(getSchemaTypes(valueSchema), name);
      const encodedFieldValue = encodeField(fieldType, newValue);
      const txHash = await writeContract(wagmiConfig, {
        abi: IBaseWorldAbi,
        address: worldAddress as Hex,
        functionName: "setField",
        args: [table.tableId, keyTuple, fieldIndex, encodedFieldValue],
        chainId,
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

      return { txHash, receipt };
    },
    onMutate: () => {
      const toastId = toast.loading("Transaction submitted");
      return { toastId };
    },
    onSuccess: ({ txHash }, newValue, { toastId }) => {
      setValue(newValue);
      toast.success(`Transaction successful with hash: ${txHash}`, {
        id: toastId,
      });
      queryClient.invalidateQueries({
        queryKey: [
          "balance",
          {
            address: account.address,
            chainId,
          },
        ],
      });
    },
    onError: (error, _, context) => {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.", {
        id: context?.toastId,
      });
      setValue(defaultValue);
    },
  });

  const handleSubmit = (newValue: unknown) => {
    if (!account.isConnected) {
      return openConnectModal?.();
    }
    mutate(newValue);
  };

  if (fieldType === "bool") {
    return (
      <div className="flex items-center gap-1">
        <Checkbox
          id={`checkbox-${name}`}
          checked={Boolean(value)}
          onCheckedChange={handleSubmit}
          disabled={isPending}
        />
        {isPending && <Loader className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  return (
    <div
      className={cn("w-full", {
        "flex cursor-wait items-center gap-1": isPending,
      })}
    >
      {!isPending && (
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            handleSubmit(localValue);
          }}
        >
          <input
            className="w-full bg-transparent"
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              setLocalValue(evt.target.value);
              setValue(evt.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={(evt) => {
              setIsFocused(false);
              handleSubmit(evt.target.value);
            }}
            value={localValue}
            disabled={isPending}
          />
        </form>
      )}

      {isPending && (
        <>
          {String(value)}
          <Loader className="h-4 w-4 animate-spin" />
        </>
      )}
    </div>
  );
}

export const EditableTableCell = memo(EditableTableCellInner, (prevProps, nextProps) => {
  console.log("prevProps", prevProps);
  console.log("nextProps", nextProps);

  // Only re-render if defaultValue has changed
  return true; // prevProps.value !== nextProps.value;
});
