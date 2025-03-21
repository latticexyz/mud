"use client";

import { AbiEvent, AbiFunction, toFunctionSelector } from "viem";
import * as z from "zod";
import { useState } from "react";
import JsonView from "react18-json-view";
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
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { getErrorSelector } from "./getErrorSelector";

const formSchema = z.object({
  selector: z.string().min(1).optional(),
});

export function DecodeForm() {
  const { data, isLoading } = useWorldAbiQuery();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [result, setResult] = useState<AbiFunction | AbiEvent>();

  function onSubmit({ selector }: z.infer<typeof formSchema>) {
    const items = data?.abi.filter((item) => item.type === "function" || item.type === "error");
    const abiItem = items?.find((item) => {
      if (item.type === "function") {
        return toFunctionSelector(item) === selector;
      } else if (item.type === "error") {
        return getErrorSelector(item) === selector;
      }

      return false;
    });

    setResult(abiItem);
  }

  if (isLoading) {
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
              <FormDescription>Find the function or error by its selector.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.isSubmitted && (
          <pre
            className={`text-md relative mt-4 rounded border border-white/20 p-3 text-sm ${!result ? "border-red-500" : ""}`}
          >
            {result ? (
              <>
                <JsonView src={result} theme="a11y" />
                <CopyButton value={JSON.stringify(result, null, 2)} className="absolute right-1.5 top-1.5" />
              </>
            ) : (
              <span className="text-red-500">No matching function or error found for this selector</span>
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
