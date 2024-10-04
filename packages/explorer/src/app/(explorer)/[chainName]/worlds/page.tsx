"use client";

import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "../../../../components/ui/Form";
import { Input } from "../../../../components/ui/Input";

const formSchema = z.object({
  worldAddress: z.string().min(1, {
    message: "World address is required.",
  }),
});

export default function WorldsPage({ params }: Props) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worldAddress: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/${params.chainName}/worlds/${values.worldAddress}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-6 font-mono text-5xl font-bold uppercase">Worlds Explorer</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <FormField
            control={form.control}
            name="worldAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter world address" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex w-full items-center gap-x-2">
            <Button className="flex-1" variant="default">
              Enter the world
            </Button>
            <Button className="flex-1" variant="secondary">
              I&apos;m feeling lucky
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
