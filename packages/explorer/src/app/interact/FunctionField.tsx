"use client";

import { Coins, Eye, Send } from "lucide-react";
import { AbiFunction } from "viem";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/Form";
import { Input } from "../../components/ui/Input";
import { Separator } from "../../components/ui/Separator";
import { useContractMutation } from "./useContractMutation";

export enum FunctionType {
  READ,
  WRITE,
}

type Props = {
  abi: AbiFunction;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
  value: z.string().optional(),
});

export function FunctionField({ abi }: Props) {
  const operationType: FunctionType =
    abi.stateMutability === "view" || abi.stateMutability === "pure" ? FunctionType.READ : FunctionType.WRITE;
  const [result, setResult] = useState<string | null>(null);
  const mutation = useContractMutation({ abi, operationType });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const mutationResult = await mutation.mutateAsync({
      inputs: values.inputs,
      value: values.value,
    });

    if (operationType === FunctionType.READ && "result" in mutationResult) {
      setResult(JSON.stringify(mutationResult.result, null, 2));
    }
  }

  const inputsLabel = abi?.inputs.map((input) => input.type).join(", ");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={abi.name} className="space-y-4 pb-4">
        <h3 className="pt-4 font-semibold">
          <span className="text-orange-500">{abi?.name}</span>
          <span className="opacity-50">{inputsLabel && ` (${inputsLabel})`}</span>
          <span className="ml-2 opacity-50">
            {abi.stateMutability === "payable" && <Coins className="mr-2 inline-block h-4 w-4" />}
            {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
              <Eye className="mr-2 inline-block h-4 w-4" />
            )}
            {abi.stateMutability === "nonpayable" && <Send className="mr-2 inline-block h-4 w-4" />}
          </span>
        </h3>

        {abi?.inputs.map((input, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`inputs.${index}`}
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
        ))}

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

        <Button type="submit" disabled={mutation.isPending}>
          {(abi.stateMutability === "view" || abi.stateMutability === "pure") && "Read"}
          {(abi.stateMutability === "payable" || abi.stateMutability === "nonpayable") && "Write"}
        </Button>

        {result && <pre className="text-md rounded border p-3 text-sm">{result}</pre>}
      </form>

      <Separator />
    </Form>
  );
}
