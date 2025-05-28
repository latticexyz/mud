"use client";

import { CoinsIcon, ExternalLinkIcon, EyeIcon, LoaderIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";
import { Abi, AbiFunction, AbiParameter, Address, Hex, decodeEventLog, stringify, toFunctionHash } from "viem";
import { useAccount, useConfig } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { z } from "zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CopyButton } from "../../../../../../../components/CopyButton";
import { Button } from "../../../../../../../components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../../components/ui/Form";
import { Input } from "../../../../../../../components/ui/Input";
import { ScrollIntoViewLink } from "../../../../../components/ScrollIntoViewLink";
import { useChain } from "../../../../../hooks/useChain";
import { blockExplorerTransactionUrl } from "../../../../../utils/blockExplorerTransactionUrl";

export enum FunctionType {
  READ,
  WRITE,
}

type Props = {
  worldAbi: Abi;
  functionAbi: AbiFunction;
};

type DecodedEvent = {
  eventName: string | undefined;
  args: readonly unknown[] | undefined;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
  value: z.string().optional(),
});

const getInputLabel = (input: AbiParameter): string => {
  if (!("components" in input)) {
    return input.type;
  }

  if (input.type === "tuple") {
    return input.name || input.type;
  } else if (input.type === "tuple[]") {
    return `${input.name}[]`;
  }
  return input.type;
};

const getInputPlaceholder = (input: AbiParameter): string => {
  if (!("components" in input)) {
    return input.type;
  }

  const componentsString = input.components.map(getInputLabel).join(", ");
  if (input.type === "tuple[]") {
    return `[${componentsString}][]`;
  }
  return `[${componentsString}]`;
};

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
  const [functionName] = useQueryState("interact_function", parseAsString.withDefault(""));
  const [functionArgs] = useQueryState("interact_args", parseAsJson<string[]>().withDefault([]));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>();
  const [events, setEvents] = useState<DecodedEvent[]>();
  const [txHash, setTxHash] = useState<Hex>();
  const txUrl = blockExplorerTransactionUrl({ hash: txHash, chainId });
  const inputLabels = functionAbi.inputs.map(getInputLabel);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: functionName === toFunctionHash(functionAbi) ? functionArgs : [],
      value: "",
    },
  });

  const getShareableUrl = useCallback(() => {
    const values = form.watch();
    if (!values.inputs?.length) return "";

    const url = new URL(window.location.href);
    url.searchParams.set("interact_function", toFunctionHash(functionAbi));
    url.searchParams.set("interact_args", JSON.stringify(values.inputs));

    return url.toString();
  }, [form, functionAbi]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
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

          setResult(stringify(result, null, 2));
        } else {
          toastId = toast.loading("Transaction submitted");
          const txHash = await writeContract(wagmiConfig, {
            abi: worldAbi,
            address: worldAddress as Address,
            functionName: functionAbi.name,
            args: values.inputs.map((value, index) => {
              const type = functionAbi.inputs[index]?.type;
              if (type === "tuple") return JSON.parse(value);
              if (type === "bool") return value === "true";
              return value;
            }),
            ...(values.value && { value: BigInt(values.value) }),
            chainId,
          });
          setTxHash(txHash);

          const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
          const events = receipt?.logs.map((log) => decodeEventLog({ ...log, abi: worldAbi }));
          setEvents(events);

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
    },
    [account.isConnected, chainId, functionAbi, openConnectModal, operationType, wagmiConfig, worldAbi, worldAddress],
  );

  return (
    <div className="pb-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id={toFunctionHash(functionAbi)}
          className="space-y-2 rounded border border-white/20 p-3 pb-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              <ScrollIntoViewLink
                elementId={toFunctionHash(functionAbi)}
                className="group inline-flex items-center hover:no-underline"
              >
                <span className="text-orange-500 group-hover:underline">{functionAbi.name}</span>
                <span className="opacity-50"> ({inputLabels.join(", ")})</span>
                <span className="ml-2 opacity-50">
                  {functionAbi.stateMutability === "payable" && <CoinsIcon className="mr-2 inline-block h-4 w-4" />}
                  {(functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure") && (
                    <EyeIcon className="mr-2 inline-block h-4 w-4" />
                  )}
                  {functionAbi.stateMutability === "nonpayable" && <SendIcon className="mr-2 inline-block h-4 w-4" />}
                </span>
              </ScrollIntoViewLink>
            </h3>
            <CopyButton value={getShareableUrl()} disabled={!form.getValues().inputs?.length} className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            {functionAbi.inputs.map((input, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`inputs.${index}`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4 space-y-0">
                    <FormLabel className="shrink-0 font-mono text-sm opacity-70">{input.name}</FormLabel>
                    <div className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={getInputPlaceholder(input)}
                          value={field.value}
                          onChange={(evt) => {
                            field.onChange(evt.target.value);
                          }}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            ))}

            {functionAbi.stateMutability === "payable" && (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="shrink-0 font-mono text-sm opacity-70">value</FormLabel>
                    <div className="min-w-[200px] flex-1">
                      <FormControl>
                        <Input placeholder="uint256" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>

          <div>
            <Button type="submit" size="sm" className="mt-2" disabled={isLoading || !account.isConnected}>
              {isLoading && <LoaderIcon className="-ml-1 mr-2 h-4 w-4 animate-spin" />}
              {operationType === FunctionType.READ ? "Read" : "Write"}
            </Button>
          </div>
        </form>
      </Form>

      {result && (
        <pre className="text-md relative mt-4 rounded border p-3 text-sm">
          {result}
          <CopyButton value={result} className="absolute right-1.5 top-1.5" />
        </pre>
      )}

      {events && (
        <div className="relative mt-4 flex-grow break-all rounded border border-white/20 p-2 pb-3">
          <ul>
            {events.map((event, idx) => (
              <li key={idx}>
                {event.eventName && <span className="text-xs">{event.eventName}:</span>}
                {event.args && (
                  <ul className="list-inside">
                    {Object.entries(event.args).map(([key, value]) => (
                      <li key={key} className="mt-1 flex">
                        <span className="text-xs text-white/60">{key}:</span>{" "}
                        <span className="text-xs">{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <CopyButton value={stringify(events, null, 2)} className="absolute right-1.5 top-1.5" />
        </div>
      )}

      {txUrl && (
        <div className="mt-3">
          <Link
            href={txUrl}
            target="_blank"
            className="flex items-center text-xs text-muted-foreground hover:underline"
          >
            <ExternalLinkIcon className="mr-2 h-3 w-3" /> View on block explorer
          </Link>
        </div>
      )}
    </div>
  );
}
