"use client";

import { ChevronsUpDown, Coins, Eye, Send } from "lucide-react";
import { useQueryState } from "nuqs";
import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useDeferredValue, useMemo, useState } from "react";
import { hexToResource } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Badge } from "../../../../../../components/ui/Badge";
import { Button } from "../../../../../../components/ui/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../../components/ui/Collapsible";
import { Input } from "../../../../../../components/ui/Input";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { cn } from "../../../../../../utils";
import { ScrollIntoViewLink } from "../../../../components/ScrollIntoViewLink";
import { useHashState } from "../../../../hooks/useHashState";
import { useSystemAbisQuery } from "../../../../queries/useSystemAbisQuery";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { FunctionField } from "./FunctionField";

function isFunction(abi: AbiItem): abi is AbiFunction {
  return abi.type === "function";
}

export function InteractForm() {
  const [hash] = useHashState();
  const { data, isFetched } = useWorldAbiQuery();
  const { data: systemData } = useSystemAbisQuery();
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({});

  const [filterValue, setFilterValue] = useQueryState("function", { defaultValue: "" });
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredSystemFunctions = useMemo(() => {
    if (!systemData) return [];

    const coreFunctions = (IBaseWorldAbi as AbiItem[]).filter((item): item is AbiFunction => {
      if (!isFunction(item)) return false;
      return item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
    });

    // TODO: add IBaseWorld even before systems are fetched
    const coreSection =
      coreFunctions.length > 0
        ? [
            {
              systemId: "core",
              name: "Core",
              namespace: "",
              functions: coreFunctions,
            },
          ]
        : [];

    const systemFunctions = Object.entries(systemData).map(([systemId, systemAbi]) => {
      const filteredFunctions = systemAbi.filter((item): item is AbiFunction => {
        if (!isFunction(item)) return false;
        return item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
      });

      return {
        systemId,
        ...hexToResource(systemId as Hex),
        functions: filteredFunctions,
      };
    });

    return [...coreSection, ...systemFunctions];
  }, [systemData, deferredFilterValue]);

  const toggleSystem = (systemId: string) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [systemId]: !prev[systemId],
    }));
  };

  console.log("filteredSystemFunctions", filteredSystemFunctions);

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
              onChange={(evt) => setFilterValue(evt.target.value)}
            />
          </div>

          <ul className="mt-4 max-h-max space-y-1 overflow-y-auto pb-4 pr-4">
            {!isFetched &&
              Array.from({ length: 10 }).map((_, index) => {
                return (
                  <li key={index} className="pr-4 pt-2">
                    <Skeleton className="h-[25px]" />
                  </li>
                );
              })}

            {filteredSystemFunctions?.map((system) => {
              if (system.functions.length === 0) return null;

              const isExpanded = expandedSystems[system.systemId];

              return (
                <li key={system.systemId}>
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleSystem(system.systemId)}
                    className="w-full space-y-1"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="group flex w-full cursor-pointer items-center justify-between space-x-1">
                        <h4 className="truncate text-sm font-semibold">
                          {system.name}{" "}
                          {system.namespace ? <span className="opacity-50">({system.namespace})</span> : ""}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                            {system.functions.length}
                          </Badge>
                          <Button variant="ghost" size="sm" className="group-hover:bg-accent">
                            <ChevronsUpDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-2">
                      <ul className="mb-4 mt-0 space-y-1">
                        {system.functions.map((abi) => {
                          const functionHash = toFunctionHash(abi);
                          return (
                            <li key={functionHash}>
                              <ScrollIntoViewLink
                                elementId={functionHash}
                                className={cn(
                                  "whitespace-nowrap text-sm hover:text-orange-500 hover:underline",
                                  functionHash === hash ? "text-orange-500" : null,
                                )}
                              >
                                <span className="opacity-50">
                                  {abi.stateMutability === "payable" && <Coins className="mr-2 inline-block h-4 w-4" />}
                                  {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
                                    <Eye className="mr-2 inline-block h-4 w-4" />
                                  )}
                                  {abi.stateMutability === "nonpayable" && (
                                    <Send className="mr-2 inline-block h-4 w-4" />
                                  )}
                                </span>
                                <span>{abi.name}</span>
                                {abi.inputs.length > 0 && <span className="opacity-50"> ({abi.inputs.length})</span>}
                              </ScrollIntoViewLink>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
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
            filteredSystemFunctions.map((system) => (
              <div key={system.systemId}>
                {system.functions.map((abi) => (
                  <FunctionField key={toFunctionHash(abi)} worldAbi={data.abi} functionAbi={abi} />
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
