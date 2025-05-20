"use client";

import { AbiFunction, AbiItem, Hex, toFunctionSelector } from "viem";
import { formatAbiItem } from "viem/utils";
import * as z from "zod";
import { useState } from "react";
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

const formSchema = z.object({
  encodedData: z.string().min(1).optional(),
});

function isAbiFunction(item: AbiItem): item is AbiFunction {
  return item.type === "function";
}

function isAbiError(item: AbiItem): item is AbiItem & { type: "error" } {
  return item.type === "error";
}

export function DecodeForm() {
  const { data: worldData, isLoading: isWorldAbiLoading } = useWorldAbiQuery();
  const { data: systemData, isLoading: isSystemAbisLoading } = useSystemAbisQuery();
  const [decoded, setDecoded] = useState<AbiFunction | AbiError | ResourceItem>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit({ encodedData }: z.infer<typeof formSchema>) {
    if (!encodedData) return;

    const worldAbi = worldData?.abi || [];
    const systemsAbis = systemData ? Object.values(systemData) : [];
    const abis = [worldAbi, ...systemsAbis].flat();

    const abiItem = abis.find((item): item is AbiFunction | AbiError => {
      if (isAbiFunction(item)) {
        return toFunctionSelector(item) === encodedData;
      } else if (isAbiError(item)) {
        return getErrorSelector(item) === encodedData;
      }
      return false;
    });

    if (abiItem) {
      setDecoded(abiItem);
      return;
    }

    // Attempt to decode as table
    try {
      const resource = hexToResource(encodedData as Hex);
      if (resource) {
        setDecoded({ type: "resource", id: encodedData, resource });
      }
    } catch {
      // ignore error
    }
  }

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
              <FormDescription>Decode function, error or resource</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.isSubmitted && (
          <pre
            className={cn("text-md relative mt-4 rounded border border-white/20 p-3 text-sm", {
              "border-red-400 bg-red-100": !decoded,
            })}
          >
            {decoded ? (
              <>
                <span className="mr-2 text-sm opacity-50">
                  {decoded.type === "resource" ? decoded.resource.type : decoded.type}
                </span>
                <span>{decoded.type === "resource" ? resourceToLabel(decoded.resource) : formatAbiItem(decoded)}</span>
                <CopyButton value={JSON.stringify(decoded, null, 2)} className="absolute right-1.5 top-1.5" />
              </>
            ) : (
              <span className="text-red-700">No matching function or error found for this selector</span>
            )}
          </pre>
        )}

        <Button type="submit" size="sm">
          Find
        </Button>
      </form>
    </Form>
  );
}
