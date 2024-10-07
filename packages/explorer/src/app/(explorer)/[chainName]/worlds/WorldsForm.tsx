"use client";

import { Address } from "viem";
import * as z from "zod";
import { Command as CommandPrimitive } from "cmdk";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../components/ui/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "../../../../components/ui/Command";
import { Form, FormControl, FormField, FormItem } from "../../../../components/ui/Form";
import { Input } from "../../../../components/ui/Input";

function Icon() {
  return (
    <svg
      className="h-12 w-12"
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      shape-rendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill="#FF7612" />
      <g clip-path="url(#clip0_1_292)">
        <path d="M52 36H36V52H52V36Z" fill="white" />
        <path d="M52 52H36V68H52V52Z" fill="white" />
        <path d="M52 68H36V84H52V68Z" fill="white" />
        <path d="M52 84H36V100H52V84Z" fill="white" />
        <path d="M52 100H36V116H52V100Z" fill="white" />
        <path d="M52 116H36V132H52V116Z" fill="white" />
        <path d="M52 132H36V148H52V132Z" fill="white" />
        <path d="M52 148H36V164H52V148Z" fill="white" />
        <path d="M68 148H52V164H68V148Z" fill="white" />
        <path d="M84 148H68V164H84V148Z" fill="white" />
        <path d="M100 148H84V164H100V148Z" fill="white" />
        <path d="M116 148H100V164H116V148Z" fill="white" />
        <path d="M132 148H116V164H132V148Z" fill="white" />
        <path d="M164 132H148V148H164V132Z" fill="white" />
        <path d="M164 148H148V164H164V148Z" fill="white" />
        <path d="M148 148H132V164H148V148Z" fill="white" />
        <path d="M164 116H148V132H164V116Z" fill="white" />
        <path d="M164 100H148V116H164V100Z" fill="white" />
        <path d="M164 84H148V100H164V84Z" fill="white" />
        <path opacity="0.5" d="M84 68H68V84H84V68Z" fill="white" />
        <path opacity="0.5" d="M84 84H68V100H84V84Z" fill="white" />
        <path opacity="0.5" d="M84 100H68V116H84V100Z" fill="white" />
        <path opacity="0.5" d="M84 116H68V132H84V116Z" fill="white" />
        <path opacity="0.5" d="M100 68H84V84H100V68Z" fill="white" />
        <path opacity="0.5" d="M116 68H100V84H116V68Z" fill="white" />
        <path opacity="0.5" d="M132 68H116V84H132V68Z" fill="white" />
        <path opacity="0.5" d="M132 84H116V100H132V84Z" fill="white" />
        <path opacity="0.5" d="M132 100H116V116H132V100Z" fill="white" />
        <path opacity="0.5" d="M132 116H116V132H132V116Z" fill="white" />
        <path opacity="0.5" d="M116 116H100V132H116V116Z" fill="white" />
        <path opacity="0.5" d="M100 116H84V132H100V116Z" fill="white" />
        <path d="M164 68H148V84H164V68Z" fill="white" />
        <path d="M164 52H148V68H164V52Z" fill="white" />
        <path d="M68 36H52V52H68V36Z" fill="white" />
        <path d="M84 36H68V52H84V36Z" fill="white" />
        <path d="M100 36H84V52H100V36Z" fill="white" />
        <path d="M116 36H100V52H116V36Z" fill="white" />
        <path d="M132 36H116V52H132V36Z" fill="white" />
        <path d="M148 36H132V52H148V36Z" fill="white" />
        <path d="M164 36H148V52H164V36Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_1_292">
          <rect width="128" height="128" fill="white" transform="translate(36 36)" />
        </clipPath>
      </defs>
    </svg>
  );
}

const formSchema = z.object({
  worldAddress: z.string().min(1, {
    message: "World address is required.",
  }),
});

export function WorldsForm({ worlds }: { worlds: Address[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worldAddress: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // router.push(`/${params.chainName}/worlds/${values.worldAddress}`);
  }

  function onRandomWorld() {
    if (worlds.length > 0) {
      // const randomWorld = worlds[Math.floor(Math.random() * worlds.length)];
      // router.push(`/${params.chainName}/worlds/${randomWorld.address}`);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-[450px] flex-col items-center justify-center p-4">
      <h1 className="mb-6 flex items-center gap-4 self-start font-mono text-4xl font-bold uppercase">
        <Icon /> Worlds Explorer
      </h1>

      <Command className="overflow-visible">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
            <div>
              <div>
                {/* <Input
                  ref={inputRef}
                  placeholder="Enter world address"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onBlur={() => setOpen(false)}
                  onFocus={() => setOpen(true)}
                /> */}

                <CommandPrimitive.Input
                  asChild
                  ref={inputRef}
                  value={searchValue}
                  onValueChange={setSearchValue}
                  onBlur={() => setOpen(false)}
                  onFocus={() => setOpen(true)}
                  placeholder="Enter world address..."
                  // className="ml-2 flex-1 bg-transparent font-mono outline-none placeholder:text-muted-foreground"
                >
                  <Input className="h-12" />
                </CommandPrimitive.Input>
              </div>

              <div className="relative">
                <CommandList>
                  {open ? (
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
                                setSearchValue(value);
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
              <Button className="flex-1 uppercase" variant="default">
                Explore the world
              </Button>
              <Button
                className="flex-1 uppercase"
                variant="secondary"
                onClick={onRandomWorld}
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
