import { Check, ChevronsUpDown, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Hex } from "viem";
import { useEffect, useState } from "react";
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
  tables: string[];
};

export function TableSelector({ tables }: Props) {
  const [selectedTableId, setTableId] = useQueryState("tableId");
  const [open, setOpen] = useState(false);
  const { worldAddress } = useParams();

  useEffect(() => {
    if (!selectedTableId && tables.length > 0) {
      setTableId(tables[0] as Hex);
    }
  }, [selectedTableId, setTableId, tables]);

  return (
    <div className="w-full py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedTableId
              ? tables.find((tableId) => tableId === selectedTableId)?.replace(`${worldAddress}__`, "")
              : "Select table..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search tables..." className="font-mono" />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {tables.map((tableId) => {
                  return (
                    <CommandItem
                      key={tableId}
                      value={tableId}
                      onSelect={(newTableId) => {
                        setTableId(newTableId as Hex);
                        setOpen(false);
                      }}
                      className="font-mono"
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedTableId === tableId ? "opacity-100" : "opacity-0")}
                      />
                      {(internalTableNames as string[]).includes(tableId) && (
                        <Lock className="mr-2 inline-block opacity-70" size={14} />
                      )}
                      {tableId.replace(`${worldAddress}__`, "")}
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
