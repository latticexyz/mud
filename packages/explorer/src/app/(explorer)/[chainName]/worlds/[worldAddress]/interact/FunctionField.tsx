"use client";

import { Coins, Eye, LoaderIcon, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Abi, AbiFunction, Address, decodeEventLog } from "viem";
import { useAccount, useConfig } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../../components/ui/Form";
import { Input } from "../../../../../../components/ui/Input";
import { Separator } from "../../../../../../components/ui/Separator";
import { useChain } from "../../../../hooks/useChain";

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

export function FunctionField({ worldAbi, functionAbi }: Props) {
  const operationType: FunctionType =
    functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure"
      ? FunctionType.READ
      : FunctionType.WRITE;
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const account = useAccount();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    let toastId;
    try {
      if (operationType === FunctionType.READ) {
        const result = await readContract(wagmiConfig, {
          abi: worldAbi,
          address: worldAddress as Address,
          functionName: functionAbi.name,
          args: values.inputs,
          chainId,
        });

        setResult(JSON.stringify(result, null, 2));
      } else {
        toastId = toast.loading("Transaction submitted");
        const txHash = await writeContract(wagmiConfig, {
          abi: worldAbi,
          address: worldAddress as Address,
          functionName: functionAbi.name,
          args: values.inputs,
          ...(values.value && { value: BigInt(values.value) }),
          chainId,
        });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
        const events = receipt?.logs.map((log) => decodeEventLog({ ...log, abi: worldAbi }));

        setResult(JSON.stringify(events, null, 2));
        toast.success(`Transaction successful with hash: ${txHash}`, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Something went wrong. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const inputsLabel = functionAbi?.inputs.map((input) => input.type).join(", ");
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
                  <Input placeholder={input.type} {...field} />
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

        <Button type="submit" disabled={isLoading || !account.isConnected}>
          {isLoading && <LoaderIcon className="-ml-2 mr-2 h-4 w-4 animate-spin" />}
          {operationType === FunctionType.READ ? "Read" : "Write"}
        </Button>

        {result && <pre className="text-md rounded border p-3 text-sm">{result}</pre>}
      </form>

      <Separator />
    </Form>
  );
}
