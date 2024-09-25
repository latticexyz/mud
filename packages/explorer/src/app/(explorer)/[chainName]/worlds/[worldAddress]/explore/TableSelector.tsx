import { CheckIcon, ChevronsUpDownIcon, Link2Icon, Link2OffIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { Hex } from "viem";
import { useState } from "react";
import { useEffect } from "react";
import { Table } from "@latticexyz/config";
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
import { cn } from "../../../../../../utils";

function TableSelectorItem({
  tableConfig,
  selected,
  asOption,
}: {
  tableConfig: Table;
  selected: boolean;
  asOption?: boolean;
}) {
  const { type, name, namespace } = tableConfig;
  return (
    <div className="flex items-center">
      {asOption && <CheckIcon className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />}
      {type === "offchainTable" && <Link2OffIcon className="mr-2 inline-block opacity-70" size={14} />}
      {type === "table" && <Link2Icon className="mr-2 inline-block opacity-70" size={14} />}
      {name} {namespace && <span className="ml-2 opacity-70">({namespace})</span>}
    </div>
  );
}

export function TableSelector({ tablesConfig }: { tablesConfig?: Table[] }) {
  const [selectedTableId, setTableId] = useQueryState("tableId");
  const [open, setOpen] = useState(false);
  const selectedTableConfig = tablesConfig?.find(({ tableId }) => tableId === selectedTableId);

  useEffect(() => {
    if (!selectedTableId && Array.isArray(tablesConfig) && tablesConfig.length > 0) {
      setTableId(tablesConfig[0].tableId);
    }
  }, [selectedTableId, setTableId, tablesConfig]);

  return (
    <div className="w-full py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={!tablesConfig}
          >
            {selectedTableConfig && (
              <TableSelectorItem
                tableConfig={selectedTableConfig}
                selected={selectedTableId === selectedTableConfig.tableId}
              />
            )}
            {!selectedTableConfig && <span className="opacity-50">Select table...</span>}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search tables..." className="font-mono" />
            <CommandList>
              <CommandEmpty className="py-4 text-center font-mono text-sm">No table found.</CommandEmpty>
              <CommandGroup>
                {tablesConfig?.map((tableConfig) => {
                  return (
                    <CommandItem
                      key={tableConfig.tableId}
                      value={tableConfig.tableId}
                      onSelect={(newTableId) => {
                        setTableId(newTableId as Hex);
                        setOpen(false);
                      }}
                      className="font-mono"
                    >
                      <TableSelectorItem
                        tableConfig={tableConfig}
                        selected={selectedTableId === tableConfig.tableId}
                        asOption
                      />
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
