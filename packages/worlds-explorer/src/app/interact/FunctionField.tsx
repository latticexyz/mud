"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AbiFunction, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { wagmiConfig } from "../_providers";
import { ACCOUNT_PRIVATE_KEYS } from "@/consts";
import { useStore } from "@/store";
import { useWorldAddress } from "@/hooks/useWorldAddress";
import { abi as WorldABI } from "../(home)/abi";

type Props = {
  abi: AbiFunction;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
});

export function FunctionField({ abi }: Props) {
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
    const toastId = toast.loading("Transaction submitted");

    try {
      const fullABI = [abi, ...WorldABI];
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
        abi: fullABI,
        address: worldAddress,
        functionName: abi.name,
        args: values.inputs,
      });

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
      });

      const logs = parseEventLogs({
        abi: fullABI,
        logs: transactionReceipt.logs,
      });
      console.log("logs:", logs);

      toast.success(`Transaction successful with hash: ${txHash}`, {
        id: toastId,
      });

      console.log("result:", txHash, transactionReceipt);
    } catch (error) {
      console.log("error:", error);

      const msg = error.message;
      toast.error(msg, {
        id: toastId,
      });
    } finally {
      fetchBalances();
    }
  }

  const inputsLabel = abi?.inputs.map((input) => input.type).join(", ");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={abi.name} className="space-y-4 pb-4">
        <h3 className="font-semibold pt-4">
          <span className="text-orange-500">{abi?.name}</span>
          <span className="opacity-50">{inputsLabel && ` (${inputsLabel})`}</span>
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

        <Button type="submit">Run</Button>
      </form>

      <Separator />
    </Form>
  );
}
