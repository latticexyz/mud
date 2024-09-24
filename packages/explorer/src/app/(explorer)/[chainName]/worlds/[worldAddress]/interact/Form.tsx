"use client";

import { Coins, Eye, Send } from "lucide-react";
import { AbiFunction } from "viem";
import { useDeferredValue, useState } from "react";
import { Input } from "../../../../../../components/ui/Input";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useHashState } from "../../../../hooks/useHashState";
import { cn } from "../../../../lib/utils";
import { useAbiQuery } from "../../../../queries/useAbiQuery";
import { FunctionField } from "./FunctionField";

export function Form() {
  const [hash] = useHashState();
  const { data, isFetched } = useAbiQuery();
  const [filterValue, setFilterValue] = useState("");
  const deferredFilterValue = useDeferredValue(filterValue);
  const filteredFunctions = data?.abi?.filter((item) =>
    item.name.toLowerCase().includes(deferredFilterValue.toLowerCase()),
  );

  return (
    <div className="flex min-h-full">
      <div className="w-[320px] flex-shrink-0">
        <div className="sticky top-2 pr-4">
          <h4 className="py-4 text-xs font-semibold uppercase opacity-70">Jump to:</h4>

          <Input
            type="text"
            placeholder="Filter functions..."
            value={deferredFilterValue}
            onChange={(evt) => {
              setFilterValue(evt.target.value);
            }}
          />

          <ul
            className="mt-4 max-h-max space-y-2 overflow-y-auto pb-4"
            style={{
              maxHeight: "calc(100vh - 160px)",
            }}
          >
            {!isFetched &&
              Array.from({ length: 10 }).map((_, index) => {
                return (
                  <li key={index} className="pt-2">
                    <Skeleton className="h-[25px]" />
                  </li>
                );
              })}

            {filteredFunctions?.map((abi, index) => {
              return (
                <li key={index}>
                  <a
                    href={`#${abi.name}`}
                    className={cn(
                      "whitespace-nowrap text-sm hover:text-orange-500 hover:underline",
                      abi.name === hash ? "text-orange-500" : null,
                    )}
                  >
                    <span className="opacity-50">
                      {abi.stateMutability === "payable" && <Coins className="mr-2 inline-block h-4 w-4" />}
                      {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
                        <Eye className="mr-2 inline-block h-4 w-4" />
                      )}
                      {abi.stateMutability === "nonpayable" && <Send className="mr-2 inline-block h-4 w-4" />}
                    </span>

                    <span>{(abi as AbiFunction).name}</span>
                    {abi.inputs.length > 0 && <span className="opacity-50"> ({abi.inputs.length})</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="min-h-full w-full border-l pl-4">
        {!isFetched && (
          <>
            <Skeleton className="h-[100px]" />
            <Separator className="my-4" />
            <Skeleton className="h-[100px]" />
            <Separator className="my-4" />
            <Skeleton className="h-[100px]" />
            <Separator className="my-4" />
            <Skeleton className="h-[100px]" />
          </>
        )}

        {filteredFunctions?.map((abi) => {
          return <FunctionField key={JSON.stringify(abi)} abi={abi as AbiFunction} />;
        })}
      </div>
    </div>
  );
}
