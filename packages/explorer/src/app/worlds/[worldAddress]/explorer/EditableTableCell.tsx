import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useChainId } from "wagmi";
import { ChangeEvent, useState } from "react";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType } from "@latticexyz/schema-type/internal";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Checkbox } from "../../../../components/ui/Checkbox";
import { ACCOUNT_PRIVATE_KEYS } from "../../../../consts";
import { camelCase, cn } from "../../../../lib/utils";
import { useStore } from "../../../../store";
import { wagmiConfig } from "../../../Providers";
import { TableConfig } from "../../../api/table/route";
import { getFieldIndex } from "../utils/getFieldIndex";

type Props = {
  name: string;
  value: string;
  keyTuple: string[];
  config: TableConfig;
};

export function EditableTableCell({ name, config, keyTuple, value: defaultValue }: Props) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { account } = useStore();
  const { worldAddress } = useParams();

  const [value, setValue] = useState<unknown>(defaultValue);

  const tableId = config?.table_id;
  const fieldType = config?.value_schema[camelCase(name)] as SchemaAbiType;

  const { mutate, isPending } = useMutation({
    mutationFn: async (newValue: unknown) => {
      const fieldIndex = getFieldIndex(config?.value_schema, camelCase(name));
      const encodedField = encodeField(fieldType, newValue);
      const txHash = await writeContract(wagmiConfig, {
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi: IBaseWorldAbi,
        address: worldAddress as Hex,
        functionName: "setField",
        args: [tableId, keyTuple, fieldIndex, encodedField],
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        pollingInterval: 100,
      });

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
            address: account,
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
    if (newValue !== defaultValue) {
      mutate(newValue);
    }
  };

  if (fieldType === "bool") {
    return (
      <>
        <Checkbox
          id={`checkbox-${name}`}
          checked={value === "1"}
          onCheckedChange={(checked) => {
            const newValue = checked ? "1" : "0";
            handleSubmit(newValue);
          }}
          disabled={isPending}
        />
        {isPending && <Loader className="h-4 w-4 animate-spin" />}
      </>
    );
  }

  return (
    <div
      className={cn("w-full", {
        "cursor-wait flex items-center gap-1": isPending,
      })}
    >
      {!isPending && (
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            handleSubmit(value);
          }}
        >
          <input
            className="w-full bg-transparent"
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              setValue(evt.target.value);
            }}
            onBlur={(evt) => handleSubmit(evt.target.value)}
            value={String(value)}
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
