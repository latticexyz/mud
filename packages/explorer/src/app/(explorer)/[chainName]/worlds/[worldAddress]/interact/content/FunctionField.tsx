"use client";

import { CoinsIcon, ExternalLinkIcon, EyeIcon, LoaderIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Abi, AbiFunction, AbiParameter, Address, Hex, decodeEventLog, encodeFunctionData, stringify } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { encodeSystemCall } from "@latticexyz/world/internal";
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
import { getFunctionElementId } from "../../../../../utils/getFunctionElementId";
import { FunctionInput } from "./FunctionInput";
import { encodeFunctionArgs } from "./encodeFunctionArgs";

export enum FunctionType {
  READ,
  WRITE,
}

type Props = {
  worldAbi: Abi;
  functionAbi: AbiFunction;
  systemId?: Hex;
  useSearchParamsArgs: boolean;
};

type DecodedEvent = {
  eventName: string | undefined;
  args: readonly unknown[] | undefined;
};

const formSchema = z.object({
  inputs: z.array(z.string()),
  value: z.string().optional(),
  resolvedAddresses: z.record(z.string().optional()).optional(),
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

export function FunctionField({ systemId, worldAbi, functionAbi, useSearchParamsArgs }: Props) {
  const searchParams = useSearchParams();
  const { id: chainId } = useChain();
  const publicClient = usePublicClient();
  const operationType: FunctionType =
    functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure"
      ? FunctionType.READ
      : FunctionType.WRITE;
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const account = useAccount();
  const { worldAddress } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>();
  const [events, setEvents] = useState<DecodedEvent[]>();
  const [txHash, setTxHash] = useState<Hex>();
  const txUrl = blockExplorerTransactionUrl({ hash: txHash, chainId });
  const inputLabels = functionAbi.inputs.map(getInputLabel);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: useSearchParamsArgs ? JSON.parse(searchParams.get("args") || "[]") : [],
      value: useSearchParamsArgs ? searchParams.get("value") ?? "" : "",
      resolvedAddresses: {},
    },
  });

  useEffect(() => {
    if (useSearchParamsArgs) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("args");
      params.delete("value");
      router.replace(`?${params.toString()}${window.location.hash}`);
    }
  }, [useSearchParamsArgs, searchParams, router]);

  const getShareableUrl = useCallback(() => {
    const values = form.watch();
    const params = new URLSearchParams(searchParams.toString());

    if (values.inputs?.length) {
      params.set("args", JSON.stringify(values.inputs));
    } else {
      params.delete("args");
    }

    if (values.value) {
      params.set("value", values.value);
    } else {
      params.delete("value");
    }

    const url = new URL(window.location.href);
    url.hash = getFunctionElementId(functionAbi, systemId);
    url.search = params.toString();

    return url.toString();
  }, [form, functionAbi, searchParams, systemId]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (!account.isConnected) {
        return openConnectModal?.();
      } else if (!publicClient) {
        toast.error("Public client not found");
        return;
      }

      setIsLoading(true);
      let toastId;

      const resolvedInputs = values.inputs.map((input, index) => {
        const resolvedAddress = form.getValues(`resolvedAddresses.${index}`);
        return resolvedAddress || input;
      });

      try {
        if (operationType === FunctionType.READ) {
          let result;
          if (systemId) {
            const encoded = encodeSystemCall({
              abi: [functionAbi],
              functionName: functionAbi.name,
              args: encodeFunctionArgs(resolvedInputs, functionAbi),
              systemId,
            });

            const { data } = await publicClient.call({
              account: account.address,
              data: encodeFunctionData({
                abi: [...worldAbi, functionAbi],
                functionName: "call",
                args: encoded,
              }),
              to: worldAddress as Address,
            });
            result = data;
          } else {
            const { data } = await publicClient.call({
              account: account.address,
              data: encodeFunctionData({
                abi: [...worldAbi, functionAbi],
                functionName: functionAbi.name,
                args: encodeFunctionArgs(resolvedInputs, functionAbi),
              }),
              to: worldAddress as Address,
            });
            result = data;
          }

          setResult(stringify(result, null, 2).replace(/^"|"$/g, ""));
        } else {
          let txHash;
          if (systemId) {
            const encoded = encodeSystemCall({
              abi: [functionAbi],
              functionName: functionAbi.name,
              args: encodeFunctionArgs(resolvedInputs, functionAbi),
              systemId,
            });

            txHash = await writeContract(wagmiConfig, {
              abi: [...worldAbi, functionAbi],
              address: worldAddress as Address,
              functionName: "call",
              args: encoded,
              ...(values.value && { value: BigInt(values.value) }),
              chainId,
            });
          } else {
            txHash = await writeContract(wagmiConfig, {
              abi: worldAbi,
              address: worldAddress as Address,
              functionName: functionAbi.name,
              args: encodeFunctionArgs(resolvedInputs, functionAbi),
              ...(values.value && { value: BigInt(values.value) }),
              chainId,
            });
          }

          setTxHash(txHash);

          const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
          const events = receipt?.logs.map((log) => decodeEventLog({ ...log, abi: worldAbi }));
          setEvents(events);

          toastId = toast.success(
            <a href={blockExplorerTransactionUrl({ hash: txHash, chainId })} target="_blank" rel="noopener noreferrer">
              Transaction successful: {txHash} <ExternalLinkIcon className="inline-block h-3 w-3" />
            </a>,
          );
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
    [
      account.address,
      account.isConnected,
      chainId,
      functionAbi,
      openConnectModal,
      operationType,
      publicClient,
      systemId,
      wagmiConfig,
      worldAbi,
      worldAddress,
      form,
    ],
  );

  return (
    <div className="pb-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id={getFunctionElementId(functionAbi, systemId)}
          className="space-y-4 rounded border border-white/10 bg-black/20 p-3 pb-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              <ScrollIntoViewLink
                elementId={getFunctionElementId(functionAbi, systemId)}
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
            <CopyButton value={getShareableUrl()} className="h-8 w-8" />
          </div>

          {functionAbi.inputs.length > 0 && (
            <div className="!mt-2 space-y-2">
              {functionAbi.inputs.map((input, index) => (
                <FunctionInput key={index} input={input} index={index} />
              ))}

              {functionAbi.stateMutability === "payable" && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormLabel className="flex shrink-0 items-center gap-x-2 pt-1 font-mono text-sm opacity-70">
                        value <CoinsIcon className="h-4 w-4" />
                      </FormLabel>
                      <div className="flex-1">
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
          )}

          <div>
            <Button type="submit" size="sm" disabled={isLoading || !account.isConnected}>
              {isLoading && <LoaderIcon className="-ml-1 mr-2 h-4 w-4 animate-spin" />}
              {operationType === FunctionType.READ ? "Read" : "Write"}
            </Button>
          </div>

          {result && (
            <pre className="text-md relative rounded border p-3 text-sm">
              {result}
              <CopyButton value={result} className="absolute right-1.5 top-1.5" />
            </pre>
          )}

          {events && (
            <div className="relative flex-grow break-all rounded border border-white/20 p-2 pb-3">
              <ul>
                {events.map((event, idx) => (
                  <li key={idx}>
                    {event.eventName && <span className="text-sm">{event.eventName}:</span>}
                    {event.args && (
                      <ul className="list-inside">
                        {Object.entries(event.args).map(([key, value]) => (
                          <li key={key} className="mt-1 flex">
                            <span className="text-sm text-white/60">{key}:</span>{" "}
                            <span className="text-sm">{String(value)}</span>
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
            <Link
              href={txUrl}
              target="_blank"
              className="flex items-center text-xs text-muted-foreground hover:underline"
            >
              <ExternalLinkIcon className="mr-2 h-3 w-3" /> View on block explorer
            </Link>
          )}
        </form>
      </Form>
    </div>
  );
}
