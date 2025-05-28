"use client";

import { ChevronsUpDown, Coins, Eye, Send } from "lucide-react";
import { useQueryState } from "nuqs";
import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useDeferredValue, useMemo, useState } from "react";
import { hexToResource } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Badge } from "../../../../../../components/ui/Badge";
import { Button } from "../../../../../../components/ui/Button";
import { Checkbox } from "../../../../../../components/ui/Checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../../components/ui/Collapsible";
import { Input } from "../../../../../../components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../components/ui/Popover";
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
  const [typeFilters, setTypeFilters] = useState<Record<string, boolean>>({
    all: true,
    view: false,
    pure: false,
    nonpayable: false,
    payable: false,
  });
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredSystemFunctions = useMemo(() => {
    if (!systemData) return [];

    const coreFunctions = (IBaseWorldAbi as AbiItem[]).filter((item): item is AbiFunction => {
      if (!isFunction(item)) return false;
      const matchesName = item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
      const matchesType = typeFilters.all || (typeFilters[item.stateMutability] ?? false);
      return matchesName && matchesType;
    });

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
        const matchesName = item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
        const matchesType = typeFilters.all || (typeFilters[item.stateMutability] ?? false);
        return matchesName && matchesType;
      });

      return {
        systemId,
        ...hexToResource(systemId as Hex),
        functions: filteredFunctions,
      };
    });

    return [...coreSection, ...systemFunctions];
  }, [systemData, deferredFilterValue, typeFilters]);

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    setTypeFilters((prev) => {
      if (type === "all") {
        return {
          all: true,
          view: false,
          pure: false,
          nonpayable: false,
          payable: false,
        };
      }

      const newFilters = {
        ...prev,
        [type]: checked,
        all: false,
      };

      // If no filters are selected, select "all"
      if (!Object.entries(newFilters).some(([key, value]) => key !== "all" && value)) {
        newFilters.all = true;
      }

      return newFilters;
    });
  };

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
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Filter functions..."
                value={deferredFilterValue}
                onChange={(evt) => setFilterValue(evt.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[120px] justify-between">
                    <span>Type</span>
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="all"
                        checked={typeFilters.all}
                        onCheckedChange={(checked) => handleTypeFilterChange("all", checked as boolean)}
                      />
                      <label htmlFor="all" className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4" />
                        <span>All</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="view"
                        checked={typeFilters.view}
                        onCheckedChange={(checked) => handleTypeFilterChange("view", checked as boolean)}
                      />
                      <label htmlFor="view" className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4" />
                        <span>Read</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pure"
                        checked={typeFilters.pure}
                        onCheckedChange={(checked) => handleTypeFilterChange("pure", checked as boolean)}
                      />
                      <label htmlFor="pure" className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4" />
                        <span>Pure</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="nonpayable"
                        checked={typeFilters.nonpayable}
                        onCheckedChange={(checked) => handleTypeFilterChange("nonpayable", checked as boolean)}
                      />
                      <label htmlFor="nonpayable" className="flex items-center gap-2 text-sm">
                        <Send className="h-4 w-4" />
                        <span>Write</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="payable"
                        checked={typeFilters.payable}
                        onCheckedChange={(checked) => handleTypeFilterChange("payable", checked as boolean)}
                      />
                      <label htmlFor="payable" className="flex items-center gap-2 text-sm">
                        <Coins className="h-4 w-4" />
                        <span>Payable</span>
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <ul className="mt-4 max-h-max overflow-y-auto pb-4 pr-4">
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
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="my-4 text-2xl font-semibold">
                    {system.name} {system.namespace ? <span className="opacity-50">({system.namespace})</span> : ""}
                  </h4>

                  <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                    {system.functions.length}
                  </Badge>
                </div>
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
