import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useEffect, useRef, useState } from "react";
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

export function EditableTableCell({ name, table, keyTuple, value, blockHeight = 0 }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const account = useAccount();
  const valueSchema = getValueSchema(table);
  const fieldType = valueSchema?.[name as never]?.type;

  const write = useMutation({
    mutationKey: ["setField", worldAddress, table.tableId, keyTuple, name],
    mutationFn: async ({ value }: { value: string | boolean }) => {
      if (!fieldType) throw new Error("Field type not found");

      const fieldIndex = getFieldIndex<ValueSchema>(getSchemaTypes(valueSchema), name);
      const encodedFieldValue = encodeField(fieldType, value);
      const txHash = await writeContract(wagmiConfig, {
        abi: IBaseWorldAbi,
        address: worldAddress as Hex,
        functionName: "setField",
        args: [table.tableId, keyTuple, fieldIndex, encodedFieldValue],
        chainId,
      });

      try {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
        if (receipt.status !== "success") {
          throw new Error("Transaction reverted");
        }

        toast.success(`Transaction successful with hash: ${txHash}`);
        queryClient.invalidateQueries({
          queryKey: [
            "balance",
            {
              address: account.address,
              chainId,
            },
          ],
        });

        return { txHash, receipt };
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : String(error) || "Something went wrong. Please try again.",
        );
        throw error;
      }
    },
  });

  // When the indexer has picked up the successful write, we can clear the write result
  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);

  const [edit, setEdit] = useState<{
    value: string;
    initialValue: string;
  } | null>(null);

  return (
    <div className="w-full">
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();

          if (!account.isConnected) {
            return openConnectModal?.();
          }

          if (fieldType === "bool") {
            write.mutate({ value: !value });
            return;
          }

          if (!edit) return;
          // Skip if our input hasn't changed from the indexer value
          if (edit.value === String(value)) {
            setEdit(null);
            return;
          }

          // Indexer value changed while we were editing, so we might
          // be at risk of overwriting a change from somewhere else.
          if (edit.initialValue !== String(value)) {
            // TODO: throw or ask user to confirm overwrite
          }

          write.mutate({ value: edit.value });
          setEdit(null);
        }}
      >
        {fieldType === "bool" ? (
          <Checkbox
            id={`checkbox-${name}`}
            checked={write.status === "pending" || write.status === "success" ? !!write.variables.value : !!value}
            onCheckedChange={() => formRef.current?.requestSubmit()}
            disabled={!account.isConnected}
          />
        ) : (
          <input
            className="w-full bg-transparent px-2 py-4"
            value={edit ? edit.value : write.status !== "idle" ? String(write.variables.value) : String(value)}
            onFocus={(event) => {
              setEdit({ value: event.currentTarget.value, initialValue: String(value) });
            }}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setEdit((state) => ({
                value: nextValue,
                initialValue: state?.initialValue ?? String(value),
              }));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                setEdit(null);
              }
            }}
            onBlur={() => formRef.current?.requestSubmit()}
            disabled={!account.isConnected}
          />
        )}
      </form>
    </div>
  );
}
