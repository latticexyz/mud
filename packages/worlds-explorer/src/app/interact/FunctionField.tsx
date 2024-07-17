"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AbiFunction, Hex } from "viem";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { privateKeyToAccount } from "viem/accounts";
import { wagmiConfig } from "../_providers";

type Props = {
  abi: AbiFunction;
};

const formSchema = z.object({
  inputs: z.string().array(),
});

export function FunctionField({ abi }: Props) {
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
      const txHash = await writeContractAsync({
        account: privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as Hex),
        abi: [abi],
        address: process.env.NEXT_PUBLIC_WORLD_ADDRESS as Hex,
        functionName: abi.name,
        args: values.inputs,
      });

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
      });

      toast.success(`Transaction successful with hash: ${txHash}`, {
        id: toastId,
      });

      console.log("result:", txHash, transactionReceipt);
    } catch (error) {
      console.log("error:", error);

      toast.error("Uh oh! Something went wrong.", {
        id: toastId,
      });
    }
  }

  const inputsLabel = abi?.inputs.map((input) => input.type).join(", ");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
        <h3 className="font-semibold pt-4">
          {abi?.name}
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
