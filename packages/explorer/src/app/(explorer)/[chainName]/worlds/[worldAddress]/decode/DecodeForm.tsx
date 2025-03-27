"use client";

import { AbiFunction, AbiItem, toFunctionSelector } from "viem";
import { formatAbiItem } from "viem/utils";
import * as z from "zod";
import { useState } from "react";
import "react18-json-view/src/dark.css";
import "react18-json-view/src/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const formSchema = z.object({
  selector: z.string().min(1).optional(),
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
  const [abiItem, setAbiItem] = useState<AbiFunction | AbiError>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit({ selector }: z.infer<typeof formSchema>) {
    const worldAbi = worldData?.abi || [];
    const systemsAbis = systemData ? Object.values(systemData) : [];
    const abis = [worldAbi, ...systemsAbis].flat();

    const abiItem = abis.find((item): item is AbiFunction | AbiError => {
      if (isAbiFunction(item)) {
        return toFunctionSelector(item) === selector;
      } else if (isAbiError(item)) {
        return getErrorSelector(item) === selector;
      }
      return false;
    });

    setAbiItem(abiItem);
  }

  if (isWorldAbiLoading || isSystemAbisLoading) {
    return <Skeleton className="h-[152px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="selector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Encoded selector</FormLabel>
              <FormControl>
                <Input placeholder="0xf0f0f0f0" type="text" {...field} />
              </FormControl>
              <FormDescription>Find the function or error by its selector</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.isSubmitted && (
          <pre
            className={cn("text-md relative mt-4 rounded border border-white/20 p-3 text-sm", {
              "border-red-400 bg-red-100": !abiItem,
            })}
          >
            {abiItem ? (
              <>
                <span className="mr-2 text-sm opacity-50">{abiItem.type === "function" ? "function" : "error"}</span>
                <span>{formatAbiItem(abiItem)}</span>
                <CopyButton value={JSON.stringify(abiItem, null, 2)} className="absolute right-1.5 top-1.5" />
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
