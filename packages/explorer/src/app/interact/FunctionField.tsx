"use client";

import { Coins, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { Abi, AbiFunction } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useWriteContract } from "wagmi";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { Button } from "../../components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/Form";
import { Input } from "../../components/ui/Input";
import { Separator } from "../../components/ui/Separator";
import { ACCOUNT_PRIVATE_KEYS } from "../../consts";
import { useWorldAddress } from "../../hooks/useWorldAddress";
import { useStore } from "../../store";
import { wagmiConfig } from "../_providers";

type Props = {
  abi: AbiFunction;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
  value: z.string().optional(),
});

export function FunctionField({ abi }: Props) {
  const [result, setResult] = useState<string | null>(null);
  const { account, fetchBalances } = useStore();
  const worldAddress = useWorldAddress();
  const { writeContractAsync } = useWriteContract();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (abi.stateMutability === "pure" || abi.stateMutability === "view") {
      const result = await readContract(wagmiConfig, {
        abi: [abi] as Abi,
        address: worldAddress,
        functionName: abi.name,
        args: values.inputs,
      });

      setResult(result as string);
    } else {
      const toastId = toast.loading("Transaction submitted");

      try {
        const txHash = await writeContractAsync({
          account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
          abi: [abi] as Abi,
          address: worldAddress,
          functionName: abi.name,
          args: values.inputs,
          ...(values.value && { value: BigInt(values.value) }),
        });

        const transactionReceipt = await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash: txHash,
            pollingInterval: 100,
          },
        );

        toast.success(`Transaction successful with hash: ${txHash}`, {
          id: toastId,
        });

        console.log("result:", txHash, transactionReceipt);
      } catch (error: Error | unknown) {
        console.log("error:", error);

        let msg = "Something went wrong. Please try again.";
        if (error instanceof Error) {
          msg = error.message;
        }

        toast.error(msg, {
          id: toastId,
        });
      } finally {
        fetchBalances();
      }
    }
  }

  const inputsLabel = abi?.inputs.map((input) => input.type).join(", ");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={abi.name}
        className="space-y-4 pb-4"
      >
        <h3 className="pt-4 font-semibold">
          <span className="text-orange-500">{abi?.name}</span>
          <span className="opacity-50">
            {inputsLabel && ` (${inputsLabel})`}
          </span>
          <span className="ml-2 opacity-50">
            {abi.stateMutability === "payable" && (
              <Coins className="mr-2 inline-block h-4 w-4" />
            )}
            {(abi.stateMutability === "view" ||
              abi.stateMutability === "pure") && (
              <Eye className="mr-2 inline-block h-4 w-4" />
            )}
            {abi.stateMutability === "nonpayable" && (
              <Send className="mr-2 inline-block h-4 w-4" />
            )}
          </span>
        </h3>

        {abi?.inputs.map((input, idx) => {
          return (
            <FormField
              key={idx}
              control={form.control}
              name={`inputs.${idx}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{input.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={input.type} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        {abi.stateMutability === "payable" && (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ETH value</FormLabel>
                <FormControl>
                  <Input placeholder="uint256" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">
          {(abi.stateMutability === "view" || abi.stateMutability === "pure") &&
            "Read"}
          {(abi.stateMutability === "payable" ||
            abi.stateMutability === "nonpayable") &&
            "Write"}
        </Button>

        {result && (
          <pre className="text-md rounded border p-3 text-sm">{result}</pre>
        )}
      </form>

      <Separator />
    </Form>
  );
}
