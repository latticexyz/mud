"use client";

import { BadgeCheckIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Address, isAddress } from "viem";
import * as z from "zod";
import { Command as CommandPrimitive } from "cmdk";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChainSwitch } from "../../../../components/ChainSwitch";
import { Button } from "../../../../components/ui/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "../../../../components/ui/Command";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../../../components/ui/Form";
import { Input } from "../../../../components/ui/Input";
import mudLogo from "../../icon.svg";
import { WorldSelectItem, WorldsQueryResult } from "../../queries/useWorldsQuery";
import { getWorldUrl } from "../../utils/getWorldUrl";

const formSchema = z.object({
  worldAddress: z
    .string()
    .refine((value) => isAddress(value), {
      message: "Invalid world address",
    })
    .transform((value): Address => value as Address),
});

type Props = {
  worlds: WorldsQueryResult["worlds"];
  isLoading: boolean;
};

export function WorldsForm({ worlds, isLoading }: Props) {
  const router = useRouter();
  const { chainName } = useParams();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = ({ worldAddress }: z.infer<typeof formSchema>) => {
    router.push(getWorldUrl(chainName as string, worldAddress));
  };

  const onLuckyWorld = () => {
    if (worlds.length > 0) {
      const luckyWorld = worlds[Math.floor(Math.random() * worlds.length)] as WorldSelectItem;
      router.push(getWorldUrl(chainName as string, luckyWorld.address));
    }
  };

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
              <div className="flex items-center gap-x-2">
                <div className="w-[260px] flex-shrink-0">
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
                            placeholder={isLoading ? "Loading worlds..." : "Enter world address..."}
                            // Need to manually trigger form submission as CommandPrimitive.Input captures Enter key events
                            onKeyDown={(e) => {
                              if (!open && e.key === "Enter") {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                            disabled={isLoading}
                          >
                            <Input className="h-12" />
                          </CommandPrimitive.Input>
                        </FormControl>
                        <FormMessage className="uppercase" />
                      </FormItem>
                    )}
                  />
                </div>

                <ChainSwitch className="w-full" />
              </div>

              <div className="relative">
                <CommandList>
                  {open && worlds.length > 0 ? (
                    <div className="absolute top-3 z-10 max-h-[200px] w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground outline-none animate-in">
                      <CommandGroup>
                        {worlds?.map((world) => {
                          return (
                            <CommandItem
                              key={world.address}
                              value={world.address}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onSelect={(value) => {
                                form.setValue("worldAddress", value as Address, {
                                  shouldValidate: true,
                                });
                                setOpen(false);
                                form.handleSubmit(onSubmit)();
                              }}
                              className="flex cursor-pointer items-center font-mono"
                            >
                              {world.name || world.address}
                              {world.verified ? <BadgeCheckIcon className="ml-2 h-4 w-4 text-green-500" /> : null}
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
              <Button type="submit" className="flex-1 uppercase" variant="default" disabled={isLoading}>
                Explore the world
              </Button>
              <Button
                className="flex-1 uppercase"
                variant="secondary"
                onClick={onLuckyWorld}
                disabled={worlds.length === 0 || isLoading}
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
