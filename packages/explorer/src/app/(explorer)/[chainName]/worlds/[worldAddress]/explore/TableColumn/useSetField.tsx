import { ExternalLinkIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useConfig } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { Table } from "@latticexyz/config";
import {
  encodeField,
  getFieldIndex,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChain } from "../../../../../hooks/useChain";
import { blockExplorerTransactionUrl } from "../../../../../utils/blockExplorerTransactionUrl";

type Props<table extends Table, fieldName extends keyof getValueSchema<table>> = {
  table: table;
  keyTuple: readonly Hex[];
  fieldName: fieldName;
};

export function useSetField<
  table extends Table,
  fieldName extends keyof getValueSchema<table> & string,
  value extends getSchemaPrimitives<getValueSchema<table>>[fieldName] = getSchemaPrimitives<
    getValueSchema<table>
  >[fieldName],
>({ table, keyTuple, fieldName }: Props<table, fieldName>) {
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();

  return useMutation({
    mutationKey: ["setField", table.tableId, keyTuple, fieldName],
    mutationFn: async ({ value }: { value: value }) => {
      const valueTypes = getSchemaTypes(getValueSchema(table));
      const fieldIndex = getFieldIndex(valueTypes, fieldName);
      const encodedFieldValue = encodeField(valueTypes[fieldName], value as never);

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

      return { txHash, receipt };
    },
    onMutate() {
      return { toastId: toast.loading("Submitting transaction…") };
    },
    onSuccess({ txHash }, variables, context) {
      toast.success(
        <a href={blockExplorerTransactionUrl({ hash: txHash, chainId })} target="_blank" rel="noopener noreferrer">
          Transaction successful: {txHash} <ExternalLinkIcon className="inline-block h-3 w-3" />
        </a>,
        { id: context.toastId },
      );
    },
    onError(error, variables, context) {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.", { id: context?.toastId });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
