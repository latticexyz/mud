"use client";

import JsonView from "react18-json-view";
import { CopyButton } from "../../../../../../components/CopyButton";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";

export function AbiExplorer() {
  const { data, isLoading, isError } = useWorldAbiQuery();

  if (isLoading) {
    return <Skeleton className="h-[106px] w-full" />;
  } else if (isError) {
    throw new Error("Failed to fetch ABI");
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold uppercase">World ABI</h4>
      <pre className="text-md relative mb-4 rounded border border-white/20 p-3 text-sm">
        <JsonView src={data?.abi} theme="a11y" />
        <CopyButton value={JSON.stringify(data?.abi, null, 2)} className="absolute right-1.5 top-1.5" />
      </pre>
    </div>
  );
}
