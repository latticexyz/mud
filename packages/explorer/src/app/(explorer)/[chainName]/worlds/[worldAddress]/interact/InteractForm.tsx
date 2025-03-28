"use client";

import { Coins, Eye, Send } from "lucide-react";
import { useQueryState } from "nuqs";
import { AbiFunction, AbiItem, stringify } from "viem";
import { useDeferredValue, useMemo } from "react";
import { Input } from "../../../../../../components/ui/Input";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { cn } from "../../../../../../utils";
import { useHashState } from "../../../../hooks/useHashState";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { FunctionField } from "./FunctionField";

function isFunction(abi: AbiItem): abi is AbiFunction {
  return abi.type === "function";
}

export function InteractForm() {
  const [hash] = useHashState();
  const { data, isFetched } = useWorldAbiQuery();
  const [filterValue, setFilterValue] = useQueryState("function", { defaultValue: "" });
  const deferredFilterValue = useDeferredValue(filterValue);
  const filteredFunctions = useMemo(() => {
    if (!data?.abi) return [];
    return data.abi.filter(
      (item): item is AbiFunction =>
        isFunction(item) && item.name.toLowerCase().includes(deferredFilterValue.toLowerCase()),
    );
  }, [data?.abi, deferredFilterValue]);

  return (
    <>
      <div className="-mr-1g -ml-1 flex gap-x-4 overflow-y-hidden">
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r pl-1">
          <div className="pr-4">
            <h4 className="py-4 text-xs font-semibold uppercase opacity-70">Jump to:</h4>
            <Input
              type="text"
              placeholder="Filter functions..."
              value={deferredFilterValue}
              onChange={(evt) => {
                setFilterValue(evt.target.value);
              }}
            />
          </div>

          <ul className="mt-4 max-h-max space-y-2 overflow-y-auto pb-4">
            {!isFetched &&
              Array.from({ length: 10 }).map((_, index) => {
                return (
                  <li key={index} className="pr-4 pt-2">
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

        <div className="w-full overflow-y-auto pl-1 pr-1">
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

          {data?.abi &&
            filteredFunctions.map((abi) => (
              <FunctionField key={stringify(abi)} worldAbi={data.abi} functionAbi={abi} />
            ))}
        </div>
      </div>
    </>
  );
}
