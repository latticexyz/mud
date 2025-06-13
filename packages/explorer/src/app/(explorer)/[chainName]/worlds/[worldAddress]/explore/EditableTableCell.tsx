import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { ChangeEvent, useEffect, useState } from "react";
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
import { useChain } from "../../../../hooks/useChain";

type Props = {
  name: string;
  value: unknown;
  table: Table;
  keyTuple: readonly Hex[];
  blockHeight?: number;
};

type CellState = {
  value: unknown;
  isEditing: boolean;
  blockHeight: number;
};

export function EditableTableCell({ name, table, keyTuple, value, blockHeight = 0 }: Props) {
  const [cellState, setCellState] = useState<CellState>({ value, blockHeight, isEditing: false });
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const account = useAccount();
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
    onSuccess: ({ txHash, receipt }, newValue, { toastId }) => {
      setCellState((prev) => ({ ...prev, value: newValue, blockHeight: Number(receipt.blockNumber) }));

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
      setCellState((prev) => ({ ...prev, value }));
    },
  });

  const handleSubmit = (newValue: unknown) => {
    if (!account.isConnected) {
      return openConnectModal?.();
    }
    mutate(newValue);
  };

  useEffect(() => {
    if (!cellState.isEditing && !isPending && cellState.blockHeight < blockHeight) {
      setCellState((prev) => ({ ...prev, value }));
    }
  }, [value, isPending, cellState.isEditing, cellState.blockHeight, blockHeight]);

  if (fieldType === "bool") {
    return (
      <div className="flex items-center gap-1">
        <Checkbox
          id={`checkbox-${name}`}
          checked={!!cellState.value}
          onCheckedChange={handleSubmit}
          disabled={isPending}
        />
        {isPending && <LoaderIcon className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  return (
    <div className="w-full">
      {isPending ? (
        <div className="flex items-center gap-1 px-2 py-4">
          {String(cellState.value)}
          <LoaderIcon className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            handleSubmit(cellState.value);
          }}
        >
          <input
            className="w-full bg-transparent px-2 py-4"
            onChange={(evt: ChangeEvent<HTMLInputElement>) =>
              setCellState((prev) => ({ ...prev, value: evt.target.value }))
            }
            onFocus={() => setCellState((prev) => ({ ...prev, isEditing: true }))}
            onBlur={(evt) => {
              setCellState((prev) => ({ ...prev, isEditing: false }));
              const newValue = evt.target.value;
              if (newValue !== String(value)) {
                handleSubmit(newValue);
              }
            }}
            value={String(cellState.value)}
            disabled={isPending}
          />
        </form>
      )}
    </div>
  );
}
