import { Check, ChevronsUpDown, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { internalTableNames } from "@latticexyz/store-sync/sqlite";
import { Button } from "../../../../../../components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../../../components/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../components/ui/Popover";
import { cn } from "../../../../../../lib/utils";

type Props = {
  value: string | undefined;
  options: string[];
};

export function TableSelector({ value, options }: Props) {
  const [open, setOpen] = useState(false);
  const { worldAddress } = useParams();

  return (
    <div className="w-full py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value ? options.find((option) => option === value)?.replace(`${worldAddress}__`, "") : "Select table..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search tables..." className="font-mono" />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(currentValue) => {
                        const url = new URL(window.location.href);
                        const searchParams = new URLSearchParams(url.search);
                        searchParams.set("tableId", currentValue);
                        window.history.pushState({}, "", `${window.location.pathname}?${searchParams}`);

                        setOpen(false);
                      }}
                      className="font-mono"
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                      {(internalTableNames as string[]).includes(option) && (
                        <Lock className="mr-2 inline-block opacity-70" size={14} />
                      )}
                      {option.replace(`${worldAddress}__`, "")}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
