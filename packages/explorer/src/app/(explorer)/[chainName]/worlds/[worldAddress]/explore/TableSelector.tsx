import { CheckIcon, ChevronsUpDownIcon, Link2Icon, Link2OffIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { Hex } from "viem";
import { useState } from "react";
import { useEffect } from "react";
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
import { DeployedTable } from "../../../../api/utils/decodeTable";

function TableSelectorItem({
  table,
  selected,
  asOption,
}: {
  table: DeployedTable;
  selected: boolean;
  asOption?: boolean;
}) {
  const { type, name, namespace } = table;
  return (
    <div className="flex items-center">
      {asOption && <CheckIcon className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />}
      {type === "offchainTable" && <Link2OffIcon className="mr-2 inline-block opacity-70" size={14} />}
      {type === "table" && <Link2Icon className="mr-2 inline-block opacity-70" size={14} />}
      {name} {namespace && <span className="ml-2 opacity-70">({namespace})</span>}
    </div>
  );
}

export function TableSelector({ tables }: { tables?: DeployedTable[] }) {
  const [selectedTableId, setTableId] = useQueryState("tableId");
  const [open, setOpen] = useState(false);
  const selectedTable = tables?.find(({ tableId }) => tableId === selectedTableId);

  useEffect(() => {
    if (!selectedTableId && Array.isArray(tables) && tables.length > 0) {
      setTableId(tables[0].tableId);
    }
  }, [selectedTableId, setTableId, tables]);

  return (
    <div className="w-full py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={!tables}
          >
            {selectedTable && (
              <TableSelectorItem table={selectedTable} selected={selectedTableId === selectedTable.tableId} />
            )}
            {!selectedTable && <span className="opacity-50">Select table...</span>}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search tables..." className="font-mono" />
            <CommandList>
              <CommandEmpty className="py-4 text-center font-mono text-sm">No table found.</CommandEmpty>
              <CommandGroup>
                {tables?.map((table) => {
                  return (
                    <CommandItem
                      key={table.tableId}
                      value={table.tableId}
                      onSelect={(newTableId) => {
                        setTableId(newTableId as Hex);
                        setOpen(false);
                      }}
                      className="font-mono"
                    >
                      <TableSelectorItem table={table} selected={selectedTableId === table.tableId} asOption />
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
