import { CheckIcon, ChevronsUpDownIcon, Link2Icon, Link2OffIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Hex } from "viem";
import { useEffect, useLayoutEffect, useState } from "react";
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
import { useChain } from "../../../../hooks/useChain";
import { useIndexerForChainId } from "../../../../hooks/useIndexerForChainId";
import { constructTableName } from "../../../../utils/constructTableName";

function TableSelectorItem({ table, selected, asOption }: { table: Table; selected: boolean; asOption?: boolean }) {
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

export function TableSelector({ tables }: { tables?: Table[] }) {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const indexer = useIndexerForChainId(chainId);
  const [selectedTableId, setTableId] = useQueryState("tableId");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedTableConfig = tables?.find(({ tableId }) => tableId === selectedTableId);

  useEffect(() => {
    if (!selectedTableId && tables?.[0]) {
      setTableId(tables[0].tableId);
    }
  }, [selectedTableId, setTableId, tables]);

  useLayoutEffect(() => {
    if (open && selectedTableId && selectedTableConfig) {
      setTimeout(() => {
        const selectedTableId = constructTableName(selectedTableConfig, worldAddress as Hex, indexer.type);
        const selectedElement = document.querySelector(`[data-value="${selectedTableId}"]`);
        selectedElement?.scrollIntoView({ behavior: "instant", block: "center" });
      }, 0);
    }
  }, [chainId, indexer.type, open, selectedTableConfig, selectedTableId, worldAddress]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={!tables}
          >
            {selectedTableConfig && (
              <TableSelectorItem
                table={selectedTableConfig}
                selected={selectedTableId === selectedTableConfig.tableId}
              />
            )}
            {!selectedTableConfig && <span className="opacity-50">Select table...</span>}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search tables..."
              className="font-mono"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty className="py-4 text-center font-mono text-sm text-muted-foreground">
                No table found.
              </CommandEmpty>
              <CommandGroup>
                {tables?.map((table) => {
                  return (
                    <CommandItem
                      key={table.tableId}
                      value={constructTableName(table, worldAddress as Hex, indexer.type)}
                      onSelect={() => {
                        setTableId(table.tableId);
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
