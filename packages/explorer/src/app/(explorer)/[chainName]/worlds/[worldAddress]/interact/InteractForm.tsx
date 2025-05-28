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

type System = {
  systemId: string;
  name: string;
  namespace: string;
  functions: AbiFunction[];
};

type NamespaceSection = {
  namespace: string;
  systems: System[];
};

type FilteredFunctions = {
  core: System[];
  namespaces: NamespaceSection[];
};

export function InteractForm() {
  const [hash] = useHashState();
  const { data, isFetched } = useWorldAbiQuery();
  const { data: systemData } = useSystemAbisQuery();
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({});

  const [filterValue, setFilterValue] = useQueryState("function", { defaultValue: "" });
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredSystemFunctions = useMemo<FilteredFunctions>(() => {
    if (!systemData) return { core: [], namespaces: [] };

    // Filter core functions
    const coreFunctions = (IBaseWorldAbi as AbiItem[]).filter((item): item is AbiFunction => {
      if (!isFunction(item)) return false;
      const matchesName = item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
      return matchesName;
    });

    // Add Core section if there are matching functions
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

    // Group systems by namespace
    const systemsByNamespace = Object.entries(systemData).reduce<Record<string, System[]>>(
      (acc, [systemId, systemAbi]) => {
        const filteredFunctions = systemAbi.filter((item): item is AbiFunction => {
          if (!isFunction(item)) return false;
          const matchesName = item.name.toLowerCase().includes(deferredFilterValue.toLowerCase());
          return matchesName;
        });

        if (filteredFunctions.length === 0) return acc;

        const system = {
          systemId,
          ...hexToResource(systemId as Hex),
          functions: filteredFunctions,
        };

        const namespace = system.namespace || "Root";
        if (!acc[namespace]) {
          acc[namespace] = [];
        }
        acc[namespace].push(system);
        return acc;
      },
      {},
    );

    // Convert to array format for rendering
    const namespaceSections = Object.entries(systemsByNamespace).map(([namespace, systems]) => ({
      namespace,
      systems,
    }));

    return {
      core: coreSection,
      namespaces: namespaceSections,
    };
  }, [systemData, deferredFilterValue]);

  const toggleSystem = (systemId: string) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [systemId]: !prev[systemId],
    }));
  };

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

            {/* Namespace sections */}
            {filteredSystemFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
              <li key={namespace}>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="group flex w-full cursor-pointer items-center justify-between space-x-1">
                      <h4 className="truncate text-sm font-semibold">{namespace}</h4>
                      <Button variant="ghost" size="sm" className="group-hover:bg-accent">
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 space-y-1">
                      {systems.map((system: System) => {
                        if (system.functions.length === 0) return null;

                        const isExpanded = expandedSystems[system.systemId];
                        return (
                          <li key={system.systemId}>
                            <Collapsible open={isExpanded} onOpenChange={() => toggleSystem(system.systemId)}>
                              <CollapsibleTrigger asChild>
                                <div className="group flex w-full cursor-pointer items-center justify-between space-x-1">
                                  <h4 className="truncate text-sm font-semibold">{system.name}</h4>
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
                                  {system.functions.map((abi: AbiFunction) => {
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
                                            {abi.stateMutability === "payable" && (
                                              <Coins className="mr-2 inline-block h-4 w-4" />
                                            )}
                                            {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
                                              <Eye className="mr-2 inline-block h-4 w-4" />
                                            )}
                                            {abi.stateMutability === "nonpayable" && (
                                              <Send className="mr-2 inline-block h-4 w-4" />
                                            )}
                                          </span>
                                          <span>{abi.name}</span>
                                          {abi.inputs.length > 0 && (
                                            <span className="opacity-50"> ({abi.inputs.length})</span>
                                          )}
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
                  </CollapsibleContent>
                </Collapsible>
              </li>
            ))}

            {/* Core section */}
            {filteredSystemFunctions.core.map((system: System) => {
              if (system.functions.length === 0) return null;

              const isExpanded = expandedSystems[system.systemId];

              return (
                <li key={system.systemId}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleSystem(system.systemId)}>
                    <CollapsibleTrigger asChild>
                      <div className="group flex w-full cursor-pointer items-center justify-between space-x-1">
                        <h4 className="truncate text-sm font-semibold">{system.name}</h4>
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
                        {system.functions.map((abi: AbiFunction) => {
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

          {data?.abi && (
            <>
              {/* Namespace sections */}
              {filteredSystemFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
                <div key={namespace}>
                  <h4 className="mt-4 text-4xl font-semibold opacity-50">{namespace}</h4>
                  {systems.map((system: System) => (
                    <div key={system.systemId}>
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="my-4 text-2xl font-semibold">{system.name}</h4>
                        <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                          {system.functions.length}
                        </Badge>
                      </div>
                      {system.functions.map((abi: AbiFunction) => (
                        <FunctionField key={toFunctionHash(abi)} worldAbi={data.abi} functionAbi={abi} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              {/* Core section */}
              {filteredSystemFunctions.core.map((system: System) => (
                <div key={system.systemId}>
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="my-4 text-2xl font-semibold">{system.name}</h4>
                    <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                      {system.functions.length}
                    </Badge>
                  </div>
                  {system.functions.map((abi: AbiFunction) => (
                    <FunctionField key={toFunctionHash(abi)} worldAbi={data.abi} functionAbi={abi} />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
