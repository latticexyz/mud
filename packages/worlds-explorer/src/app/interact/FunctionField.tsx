"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AbiFunction } from "viem";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Props = {
  data: AbiFunction;
};

const formSchema = z.object({
  inputs: z.string().array(),
});

export function FunctionField({ data }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputs: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const inputsLabel = data?.inputs.map((input) => input.type).join(", ");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
        <h3 className="font-semibold pt-4">
          {data?.name}
          <span className="opacity-50">{inputsLabel && ` (${inputsLabel})`}</span>
        </h3>

        {data?.inputs.map((input, idx) => {
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
