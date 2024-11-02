"use client";

import { Coins, Eye, Send } from "lucide-react";
import { Abi, AbiFunction } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../../components/ui/Form";
import { Input } from "../../../../../../components/ui/Input";
import { Separator } from "../../../../../../components/ui/Separator";
import { useContractMutation } from "./useContractMutation";

export enum FunctionType {
  READ,
  WRITE,
}

type Props = {
  worldAbi: Abi;
  functionAbi: AbiFunction;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
  value: z.string().optional(),
});

const formatInputs = (functionAbi: AbiFunction, inputs: string[]) => {
  return inputs.map((input, idx) => {
    const inputAbi = functionAbi.inputs[idx];
    if (!inputAbi) {
      return input;
    }

    const type = inputAbi?.type;
    if (type.startsWith("int") || type.startsWith("uint")) {
      return BigInt(input);
    }

    if (type === "tuple") {
      const cleanedInput = input.replace(/^\[|\]$|^\(|\)$/g, "").trim();
      const values = cleanedInput.split(",").map((v) => v.trim());

      return values.map((value) => {
        const type = inputAbi.components[idx].type;
        if (type.startsWith("int") || type.startsWith("uint")) {
          return BigInt(JSON.parse(value));
        }

        return value;
      });
    }

    return input;
  });
};

export function FunctionField({ worldAbi, functionAbi }: Props) {
  const operationType: FunctionType =
    functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure"
      ? FunctionType.READ
      : FunctionType.WRITE;
  const [result, setResult] = useState<string | null>(null);
  const { openConnectModal } = useConnectModal();
  const mutation = useContractMutation({ worldAbi, functionAbi, operationType });
  const account = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account.isConnected) {
      return openConnectModal?.();
    }

    const mutationResult = await mutation.mutateAsync({
      inputs: formatInputs(functionAbi, values.inputs),
      value: values.value,
    });

    if (operationType === FunctionType.READ && "result" in mutationResult) {
      setResult(JSON.stringify(mutationResult.result, null, 2));
    }
  }

  const formatType = (type: string) => {
    if (type === "tuple") {
      return `tuple (${functionAbi.inputs.map((input) => input.type).join(", ")})`;
    }
    return type;
  };

  const inputsLabel = functionAbi?.inputs.map((input) => formatType(input.type)).join(", ");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={functionAbi.name} className="space-y-4 pb-4">
        <h3 className="pt-4 font-semibold">
          <span className="text-orange-500">{functionAbi?.name}</span>
          <span className="opacity-50">{inputsLabel && ` (${inputsLabel})`}</span>
          <span className="ml-2 opacity-50">
            {functionAbi.stateMutability === "payable" && <Coins className="mr-2 inline-block h-4 w-4" />}
            {(functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure") && (
              <Eye className="mr-2 inline-block h-4 w-4" />
            )}
            {functionAbi.stateMutability === "nonpayable" && <Send className="mr-2 inline-block h-4 w-4" />}
          </span>
        </h3>

        {functionAbi?.inputs.map((input, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`inputs.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{input.name}</FormLabel>
                <FormControl>
                  <Input placeholder={formatType(input.type)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {functionAbi.stateMutability === "payable" && (
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
          {(functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure") && "Read"}
          {(functionAbi.stateMutability === "payable" || functionAbi.stateMutability === "nonpayable") && "Write"}
        </Button>

        {result && <pre className="text-md rounded border p-3 text-sm">{result}</pre>}
      </form>

      <Separator />
    </Form>
  );
}
