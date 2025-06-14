import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useEffect, useState } from "react";
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
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const account = useAccount();
  const valueSchema = getValueSchema(table);
  const fieldType = valueSchema?.[name as never]?.type;

  const write = useMutation({
    // TODO: mutationKey
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

      const toastId = toast.loading("Transaction submitted");
      try {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
        // TODO: check receipt.status, throw if reverted

        toast.success(`Transaction successful with hash: ${txHash}`, { id: toastId });

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
          { id: toastId },
        );
        throw error;
      }
    },
  });

  // When the indexer has picked up the successful write, we can clear the write result.
  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);

  // While we're editing or waiting for a save, pending state is filled in
  // otherwise it's null
  //
  // when we enter editing state, we set pending value and the block height at which we started editing
  // so before save, we can check if the block height of the backend state has shifted and ask the
  // user if they really want to apply over the new value that came in
  const [pendingInputValue, setPendingInputValue] = useState<{
    value: string;
    initialValue: unknown;
  } | null>(null);
  const inputValue = pendingInputValue
    ? pendingInputValue.value
    : write.status !== "idle"
      ? String(write.variables.value)
      : String(value);

  if (fieldType === "bool") {
    return (
      <div className="flex items-center gap-1">
        <Checkbox
          id={`checkbox-${name}`}
          disabled={write.status === "pending"}
          checked={write.status !== "idle" ? !!write.variables.value : !!value}
          onCheckedChange={(checked) => {
            if (!account.isConnected) {
              return openConnectModal?.();
            }
            write.mutate({ value: checked.valueOf() });
          }}
        />
        {write.status === "pending" ? <LoaderIcon className="h-4 w-4 animate-spin" /> : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      {write.status === "pending" ? (
        <div className="flex items-center gap-1 px-2 py-4">
          {inputValue}
          <LoaderIcon className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();

            // Skip if no pending changes
            if (!pendingInputValue) return;
            // Skip if our input hasn't changed from the indexer value
            if (pendingInputValue.value === String(value)) {
              setPendingInputValue(null);
              return;
            }

            // Indexer value changed while we were editing, so we might
            // be at risk of overwriting a change from somewhere else.
            if (pendingInputValue.initialValue !== value) {
              // TODO: throw or ask user to confirm overwrite
            }

            if (!account.isConnected) {
              return openConnectModal?.();
            }

            write.mutate(pendingInputValue, {
              onSuccess: () => {
                setPendingInputValue(null);
              },
            });
          }}
        >
          <input
            className="w-full bg-transparent px-2 py-4"
            value={inputValue}
            onFocus={() => {
              setPendingInputValue({ value: inputValue, initialValue: value });
            }}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              setPendingInputValue((state) => ({
                value: nextValue,
                initialValue: state?.initialValue ?? value,
              }));
            }}
            onBlur={(event) => {
              event.currentTarget.form?.submit();
            }}
          />
        </form>
      )}
    </div>
  );
}
