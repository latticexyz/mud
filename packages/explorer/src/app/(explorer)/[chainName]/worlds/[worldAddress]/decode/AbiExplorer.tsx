"use client";

import { XIcon } from "lucide-react";
import { AbiItem } from "viem";
import { useDeferredValue, useMemo, useState } from "react";
import JsonView from "react18-json-view";
import { CopyButton } from "../../../../../../components/CopyButton";
import { Checkbox } from "../../../../../../components/ui/Checkbox";
import { Input } from "../../../../../../components/ui/Input";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";

const filterTypes = ["function", "event", "error"] as const;

export function AbiExplorer() {
  const { data, isLoading, isError } = useWorldAbiQuery();
  const [filterValue, setFilterValue] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<AbiItem["type"]>>(new Set(filterTypes));
  const deferredFilterValue = useDeferredValue(filterValue);

  const hasActiveFilters = filterValue || selectedTypes.size !== filterTypes.length;

  const filteredAbi = useMemo(() => {
    if (!data?.abi) return [];

    const filtered = data.abi.filter((item: AbiItem) => {
      if (!selectedTypes.has(item.type)) return false;

      if (deferredFilterValue) {
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(deferredFilterValue.toLowerCase());
      }
      return true;
    });

    return filtered;
  }, [data?.abi, deferredFilterValue, selectedTypes]);

  const handleTypeToggle = (type: AbiItem["type"]) => {
    const newSelectedTypes = new Set(selectedTypes);
    if (newSelectedTypes.has(type)) {
      newSelectedTypes.delete(type);
    } else {
      newSelectedTypes.add(type);
    }
    setSelectedTypes(newSelectedTypes);
  };

  const handleClearFilters = () => {
    setFilterValue("");
    setSelectedTypes(new Set(filterTypes));
  };

  if (isLoading) {
    return <Skeleton className="h-[106px] w-full" />;
  } else if (isError) {
    throw new Error("Failed to fetch ABI");
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold uppercase">World ABI</h4>

      <div className="space-y-3">
        <Input
          type="search"
          placeholder="Filter ABI…"
          value={filterValue}
          onChange={(evt) => setFilterValue(evt.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          {filterTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <Checkbox checked={selectedTypes.has(type)} onCheckedChange={() => handleTypeToggle(type)} />
              <span className="capitalize">{`${type}s`}</span>
            </label>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <XIcon className="h-4 w-4" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <pre className="text-md relative mb-4 rounded border border-white/20 p-3 text-sm">
        <JsonView src={filteredAbi} theme="a11y" />
        <CopyButton value={JSON.stringify(filteredAbi, null, 2)} className="absolute right-1.5 top-1.5" />
      </pre>
    </div>
  );
}
