"use client";

import { AbiItem } from "viem";
import { useDeferredValue, useMemo, useState } from "react";
import JsonView from "react18-json-view";
import { CopyButton } from "../../../../../../components/CopyButton";
import { Input } from "../../../../../../components/ui/Input";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";

export function AbiExplorer() {
  const { data, isLoading, isError } = useWorldAbiQuery();
  const [filterValue, setFilterValue] = useState("");
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredAbi = useMemo(() => {
    if (!data?.abi) return [];

    if (!deferredFilterValue) return data.abi;

    const searchLower = deferredFilterValue.toLowerCase();
    return data.abi.filter((item: AbiItem) => {
      const itemString = JSON.stringify(item).toLowerCase();
      return itemString.includes(searchLower);
    });
  }, [data?.abi, deferredFilterValue]);

  if (isLoading) {
    return <Skeleton className="h-[106px] w-full" />;
  } else if (isError) {
    throw new Error("Failed to fetch ABI");
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold uppercase">World ABI</h4>

      <Input
        type="search"
        placeholder="Filter ABI…"
        value={filterValue}
        onChange={(evt) => setFilterValue(evt.target.value)}
      />

      <pre className="text-md relative mb-4 rounded border border-white/20 p-3 text-sm">
        <JsonView src={filteredAbi} theme="a11y" />
        <CopyButton value={JSON.stringify(filteredAbi, null, 2)} className="absolute right-1.5 top-1.5" />
      </pre>
    </div>
  );
}
