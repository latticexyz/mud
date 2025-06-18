import { ExternalLinkIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { useConfig } from "wagmi";
import { useAccount } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useEffect } from "react";
import { Table } from "@latticexyz/config";
import {
  ValueSchema,
  encodeField,
  getFieldIndex,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChain } from "../../../../../hooks/useChain";
import { blockExplorerTransactionUrl } from "../../../../../utils/blockExplorerTransactionUrl";

type SetFieldParams<T extends ValueSchema[string]> = {
  tableConfig: Table;
  keyTuple: readonly Hex[];
  fieldName: string;
  value: T extends "bool" ? boolean : string;
};

type Props = {
  blockHeight: number;
  reset?: () => void;
};

export function useSetFieldMutation<T extends ValueSchema[string]>({ blockHeight, reset }: Props) {
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const account = useAccount();

  const write = useMutation({
    mutationFn: async ({ tableConfig, keyTuple, fieldName, value }: SetFieldParams<T>) => {
      const valueSchema = getValueSchema(tableConfig);
      const fieldType = valueSchema?.[fieldName as never]?.type;
      if (!fieldType) throw new Error("Field type not found");

      let toastId;
      try {
        toastId = toast.loading("Submitting transaction…");

        const fieldIndex = getFieldIndex<ValueSchema>(getSchemaTypes(valueSchema), fieldName);
        const encodedFieldValue = encodeField(fieldType, value);

        const txHash = await writeContract(wagmiConfig, {
          abi: IBaseWorldAbi,
          address: worldAddress as Hex,
          functionName: "setField",
          args: [tableConfig.tableId, keyTuple, fieldIndex, encodedFieldValue],
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

        return { txHash, receipt };
      } catch (error) {
        if (reset) {
          reset();
        }

        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : String(error) || "Something went wrong. Please try again.",
          {
            id: toastId,
          },
        );
        throw error;
      } finally {
        queryClient.invalidateQueries({
          queryKey: [
            "balance",
            {
              address: account.address,
              chainId,
            },
          ],
        });

        if (reset) {
          reset();
        }
      }
    },
  });

  // When the indexer has picked up the successful write, we can clear the write result
  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);

  return write;
}
