"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Address, isAddress } from "viem";
import * as z from "zod";
import { Command as CommandPrimitive } from "cmdk";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../components/ui/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "../../../../components/ui/Command";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../../../components/ui/Form";
import { Input } from "../../../../components/ui/Input";
import mudLogo from "../../icon.svg";
import { getWorldUrl } from "../../utils/getWorldUrl";

const formSchema = z.object({
  worldAddress: z
    .string()
    .refine((value) => isAddress(value), {
      message: "Invalid world address",
    })
    .transform((value): Address => value as Address),
});

export function WorldsForm({ worlds }: { worlds: Address[] }) {
  const router = useRouter();
  const { chainName } = useParams();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
  });

  function onSubmit({ worldAddress }: z.infer<typeof formSchema>) {
    router.push(getWorldUrl(chainName as string, worldAddress));
  }

  function onLuckyWorld() {
    if (worlds.length > 0) {
      const luckyAddress = worlds[Math.floor(Math.random() * worlds.length)];
      router.push(getWorldUrl(chainName as string, luckyAddress as Address));
    }
  }

  const handleOpenOptions = () => {
    if (!open && worlds.length > 0) {
      setOpen(true);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-[450px] flex-col items-center justify-center p-4">
      <h1 className="flex items-center gap-6 self-start font-mono text-4xl font-bold uppercase">
        <Image src={mudLogo} alt="MUD logo" width={48} height={48} /> Worlds Explorer
      </h1>

      <Command className="mt-6 overflow-visible bg-transparent">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormField
                control={form.control}
                name="worldAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CommandPrimitive.Input
                        asChild
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        onBlur={() => {
                          field.onBlur();
                          setOpen(false);
                        }}
                        onFocus={handleOpenOptions}
                        placeholder="Enter world address..."
                        // Need to manually trigger form submission as CommandPrimitive.Input captures Enter key events
                        onKeyDown={(e) => {
                          if (!open && e.key === "Enter") {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      >
                        <Input className="h-12" />
                      </CommandPrimitive.Input>
                    </FormControl>
                    <FormMessage className="uppercase" />
                  </FormItem>
                )}
              />

              <div className="relative">
                <CommandList>
                  {open && worlds.length > 0 ? (
                    <div className="absolute top-3 z-10 max-h-[200px] w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground outline-none animate-in">
                      <CommandGroup>
                        {worlds?.map((world) => {
                          return (
                            <CommandItem
                              key={world}
                              value={world}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onSelect={(value) => {
                                form.setValue("worldAddress", value as Address, {
                                  shouldValidate: true,
                                });
                                setOpen(false);
                              }}
                              className="cursor-pointer font-mono"
                            >
                              {world}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </div>
                  ) : null}
                </CommandList>
              </div>
            </div>

            <div className="flex w-full items-center gap-x-2">
              <Button type="submit" className="flex-1 uppercase" variant="default">
                Explore the world
              </Button>
              <Button
                className="flex-1 uppercase"
                variant="secondary"
                onClick={onLuckyWorld}
                disabled={worlds.length === 0}
              >
                I&apos;m feeling lucky
              </Button>
            </div>
          </form>
        </Form>
      </Command>
    </div>
  );
}
