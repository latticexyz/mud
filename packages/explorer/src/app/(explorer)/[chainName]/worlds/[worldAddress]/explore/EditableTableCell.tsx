import { ExternalLinkIcon } from "lucide-react";
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
import { useChain } from "../../../../hooks/useChain";
import { TDataRow } from "../../../../queries/useTableDataQuery";
import { blockExplorerTransactionUrl } from "../../../../utils/blockExplorerTransactionUrl";

type Props = {
  name: string;
  value: TDataRow[string];
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
    mutationFn: async ({ value }: { value: string }) => {
      if (!fieldType) throw new Error("Field type not found");

      let toastId;
      try {
        toastId = toast.loading("Submitting transaction…");

        const fieldIndex = getFieldIndex<ValueSchema>(getSchemaTypes(valueSchema), name);
        const encodedFieldValue = encodeField(fieldType, value);

        const txHash = await writeContract(wagmiConfig, {
          abi: IBaseWorldAbi,
          address: worldAddress as Hex,
          functionName: "setField",
          args: [table.tableId, keyTuple, fieldIndex, encodedFieldValue],
          chainId,
        });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
        if (receipt.status !== "success") {
          throw new Error("Transaction reverted. Please try again.");
        }

        toast.success(
          <a href={blockExplorerTransactionUrl({ hash: txHash, chainId })} target="_blank" rel="noopener noreferrer">
            Transaction successful: {txHash} <ExternalLinkIcon className="inline-block h-3 w-3" />
          </a>,
          {
            id: toastId,
          },
        );
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
        setEdit(null);

        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : String(error) || "Something went wrong. Please try again.",
          {
            id: toastId,
          },
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

  const latestValue = write.status === "success" ? write.variables.value : value ? String(value) : "";
  return (
    <div className="w-full">
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();

          if (!account.isConnected) {
            return openConnectModal?.();
          }

          const formData = new FormData(event.currentTarget);
          const nextValue = formData.get(name);
          if (typeof nextValue !== "string") {
            return;
          }

          // Skip if our input hasn't changed from the indexer value
          if (nextValue === latestValue) {
            return;
          }

          // Indexer value changed while we were editing, so we might
          // be at risk of overwriting a change from somewhere else.
          if (edit?.initialValue !== latestValue) {
            const confirm = window.confirm("Value changed while editing. Are you sure you want to overwrite it?");
            if (!confirm) {
              return;
            }
          }

          write.mutate({ value: nextValue });
        }}
        aria-label={`Edit ${name} field`}
      >
        <input
          className="bg-transparent px-2 py-4"
          name={name}
          value={edit ? edit.value : latestValue}
          onFocus={(event) => setEdit({ value: event.currentTarget.value, initialValue: latestValue })}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setEdit((state) => ({
              value: nextValue,
              initialValue: state?.initialValue ?? latestValue,
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
      </form>
    </div>
  );
}
