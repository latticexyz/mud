"use client";

import {
  AbiFunction,
  AbiItem,
  Hex,
  decodeErrorResult,
  decodeFunctionData,
  parseAbiItem,
  toFunctionSelector,
} from "viem";
import { formatAbiItem } from "viem/utils";
import * as z from "zod";
import { useMemo, useState } from "react";
import "react18-json-view/src/dark.css";
import "react18-json-view/src/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resource, hexToResource, resourceToLabel } from "@latticexyz/common";
import { CopyButton } from "../../../../../../components/CopyButton";
import { Button } from "../../../../../../components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/Form";
import { Input } from "../../../../../../components/ui/Input";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { cn } from "../../../../../../utils";
import { useSystemAbisQuery } from "../../../../queries/useSystemAbisQuery";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { getErrorSelector } from "./getErrorSelector";

type AbiError = AbiItem & { type: "error" };
type ResourceItem = { type: "resource"; id: string; resource: Resource };
type SelectorDatabase = { type: "signature"; selectors: string[] };
type Result = {
  type: string;
  label: string;
  decodedCall?: DecodedFunctionCall;
};

type DecodedFunctionCall = {
  args: readonly unknown[];
  abi: AbiFunction | AbiError;
  functionName?: string;
  errorName?: string;
};

const formSchema = z.object({
  encodedData: z.string().min(1).optional(),
});

function isAbiFunction(item: AbiItem): item is AbiFunction {
  return item.type === "function";
}

function isAbiError(item: AbiItem): item is AbiItem & { type: "error" } {
  return item.type === "error";
}

function stringifyValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `[${value.map(stringifyValue).join(", ")}]`;
    }
    return `{${Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${stringifyValue(val)}`)
      .join(", ")}}`;
  }
  return String(value);
}

function decodeAbiItem(abiItem: AbiFunction | AbiError, data: Hex): DecodedFunctionCall {
  if (abiItem.type === "function") {
    const result = decodeFunctionData({ abi: [abiItem], data });
    return { args: result.args, abi: abiItem, functionName: result.functionName };
  } else {
    const result = decodeErrorResult({ abi: [abiItem], data });
    return { args: result.args, abi: abiItem, errorName: result.errorName };
  }
}

export function DecodeForm() {
  const { data: worldData, isLoading: isWorldAbiLoading } = useWorldAbiQuery();
  const { data: systemData, isLoading: isSystemAbisLoading } = useSystemAbisQuery();
  const [decoded, setDecoded] = useState<AbiFunction | AbiError | ResourceItem | SelectorDatabase>();
  const [encoded, setEncoded] = useState<string | undefined>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async ({ encodedData }: z.infer<typeof formSchema>) => {
    setEncoded(encodedData);
    if (!encodedData) return;

    const selector = encodedData.substring(0, 10);
    const worldAbi = worldData?.abi || [];
    const systemsAbis = systemData ? Object.values(systemData) : [];
    const abis = [worldAbi, ...systemsAbis].flat();

    // Try to find matching ABI item
    const abiItem = abis.find((item): item is AbiFunction | AbiError => {
      if (isAbiFunction(item)) {
        return toFunctionSelector(item) === selector;
      }
      if (isAbiError(item)) {
        return getErrorSelector(item) === selector;
      }
      return false;
    });

    if (abiItem) {
      setDecoded(abiItem);
      return;
    }

    // Try to decode as resource
    try {
      const resource = hexToResource(encodedData as Hex);
      if (resource) {
        setDecoded({ type: "resource", id: encodedData, resource });
        return;
      }
    } catch {
      // Error decoding resource
    }

    // Try to find in 4-byte database
    if (selector.length !== 10) return;
    try {
      const response = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`);
      const data = await response.json();
      if (data.results.length > 0) {
        setDecoded({
          type: "signature",
          selectors: data.results.map((result: { text_signature: string }) => result.text_signature),
        });
      }
    } catch {
      // Error fetching 4byte data
    }
  };

  const results = useMemo<Result[]>(() => {
    if (!decoded || !encoded) return [];
    try {
      if (decoded.type === "resource") {
        return [{ type: decoded.resource.type, label: resourceToLabel(decoded.resource) }];
      }
      if (decoded.type === "function" || decoded.type === "error") {
        const decodedCall = decodeAbiItem(decoded, encoded as Hex);
        return [{ type: decoded.type, label: formatAbiItem(decoded), decodedCall }];
      }
      if (decoded.type === "signature") {
        return decoded.selectors.map((selector) => {
          const abiItem = parseAbiItem(`function ${selector}`) as AbiFunction;
          const decodedCall = decodeAbiItem(abiItem, encoded as Hex);
          return { type: "signature", label: selector, decodedCall };
        });
      }
    } catch {
      // Error decoding function data
    }
    return [];
  }, [decoded, encoded]);

  if (isWorldAbiLoading || isSystemAbisLoading) {
    return <Skeleton className="h-[152px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="encodedData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Encoded data</FormLabel>
              <FormControl>
                <Input placeholder="0xf0f0f0f0" type="text" {...field} />
              </FormControl>
              <FormDescription>Decode function, error or resource data</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.isSubmitted && (
          <>
            {results.length > 0 ? (
              results.map(({ type, label, decodedCall }, index) => (
                <pre key={`call-${index}`} className="text-md relative mt-4 rounded border border-white/20 p-3 text-sm">
                  <span className="mr-2 text-sm opacity-50">{type}</span>
                  <span>{label}</span>
                  <pre className="block whitespace-pre-wrap">
                    {decodedCall?.abi?.inputs?.map((input, inputIndex) => (
                      <p key={`input-${inputIndex}`} className={"ml-4"}>
                        <span className="opacity-50">{input.name ?? `arg ${inputIndex}`}: </span>
                        <span>{stringifyValue(decodedCall.args[inputIndex])}</span>
                      </p>
                    ))}
                  </pre>
                  <CopyButton value={JSON.stringify(decoded, null, 2)} className="absolute right-1.5 top-1.5" />
                </pre>
              ))
            ) : (
              <pre
                className={cn("text-md relative mt-4 rounded border border-white/20 p-3 text-sm", {
                  "border-red-400 bg-red-100": !decoded,
                })}
              >
                <span className="text-red-700">No matching function, error or resource found for this data</span>
              </pre>
            )}
          </>
        )}

        <Button type="submit" size="sm">
          Find
        </Button>
      </form>
    </Form>
  );
}
