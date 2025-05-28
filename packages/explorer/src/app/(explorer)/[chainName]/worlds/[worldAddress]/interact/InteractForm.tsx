"use client";

import { useQueryState } from "nuqs";
import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { hexToResource } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Input } from "../../../../../../components/ui/Input";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useHashState } from "../../../../hooks/useHashState";
import { useSystemAbisQuery } from "../../../../queries/useSystemAbisQuery";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { SystemContent } from "./content/SystemContent";
import { FunctionSidebarItem } from "./sidebar/FunctionSidebarItem";
import { SystemSidebarItem } from "./sidebar/SystemSidebarItem";

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
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({
    root: true,
  });
  const [filterValue, setFilterValue] = useQueryState("function", { defaultValue: "" });
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredSystemFunctions = useMemo<FilteredFunctions>(() => {
    if (!systemData) return { core: [], namespaces: [] };

    const searchLower = deferredFilterValue.toLowerCase();

    const coreFunctions = (IBaseWorldAbi as AbiItem[]).filter((item): item is AbiFunction => {
      if (!isFunction(item)) return false;
      const matchesName = `core_core_${item.name}`.toLowerCase().includes(searchLower);
      return matchesName;
    });

    const coreSection =
      coreFunctions.length > 0
        ? [
            {
              systemId: "core",
              name: "core",
              namespace: "",
              functions: coreFunctions,
            },
          ]
        : [];

    const systemsByNamespace = Object.entries(systemData).reduce<Record<string, System[]>>(
      (acc, [systemId, systemAbi]) => {
        const { namespace, name: systemName } = hexToResource(systemId as Hex);
        const namespaceName = namespace || "root";

        const filteredFunctions = systemAbi.filter((item): item is AbiFunction => {
          if (!isFunction(item)) return false;
          const searchString = `${namespaceName}_${systemName}_${item.name}`.toLowerCase();
          return searchString.includes(searchLower);
        });

        if (filteredFunctions.length === 0) return acc;

        const system = {
          systemId,
          namespace: namespaceName,
          name: systemName,
          functions: filteredFunctions,
        };

        if (!acc[namespaceName]) {
          acc[namespaceName] = [];
        }
        const namespaceArray = acc[namespaceName];
        if (namespaceArray) {
          namespaceArray.push(system);
        }
        return acc;
      },
      {},
    );

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
    setExpandedSystems((prev) => {
      const newState = { ...prev };
      const isExpanding = !prev[systemId];

      if (isExpanding === false) {
        const namespace = systemId;
        const systems = filteredSystemFunctions.namespaces.find((ns) => ns.namespace === namespace)?.systems || [];
        systems.forEach((system) => {
          newState[system.systemId] = false;
        });
      }

      newState[systemId] = isExpanding;
      return newState;
    });
  };

  // Expand matching systems when the filter value is changed
  useEffect(() => {
    if (!deferredFilterValue) {
      setExpandedSystems({ root: true });
      return;
    }

    const newExpandedState: Record<string, boolean> = {};

    if (filteredSystemFunctions.core.length > 0) {
      newExpandedState.core = true;
    }

    filteredSystemFunctions.namespaces.forEach(({ namespace, systems }) => {
      if (systems.length > 0) {
        newExpandedState[namespace] = true;
        systems.forEach((system) => {
          newExpandedState[system.systemId] = true;
        });
      }
    });

    setExpandedSystems(newExpandedState);
  }, [deferredFilterValue, filteredSystemFunctions]);

  // Expand matching systems when opened with a hash
  useEffect(() => {
    if (!hash || !systemData) return;

    const coreFunction = (IBaseWorldAbi as AbiItem[]).find((item) => {
      if (item.type !== "function") return false;
      return toFunctionHash(item) === hash;
    });

    if (coreFunction) {
      setExpandedSystems((prev) => ({
        ...prev,
        root: false,
        core: true,
      }));
      return;
    }

    for (const [systemId, systemAbi] of Object.entries(systemData)) {
      const functionWithHash = systemAbi.find((item) => {
        if (item.type !== "function") return false;
        return toFunctionHash(item) === hash;
      });

      if (functionWithHash) {
        const { namespace } = hexToResource(systemId as Hex);
        setExpandedSystems((prev) => ({
          ...prev,
          [namespace || "root"]: true,
          [systemId]: true,
        }));
        break;
      }
    }
  }, [hash, systemData]);

  return (
    <>
      <div className="-mr-1g -ml-1 flex gap-x-4 overflow-y-hidden">
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r pl-1">
          <div className="pr-4">
            <h4 className="py-4 text-xs font-semibold uppercase opacity-70">Jump to:</h4>
            <Input
              type="search"
              placeholder="Filter by namespace, system, or function..."
              value={deferredFilterValue}
              onChange={(evt) => setFilterValue(evt.target.value)}
            />
          </div>

          <ul className="mt-4 max-h-max overflow-y-auto pb-4 pr-4">
            {!isFetched &&
              Array.from({ length: 6 }).map((_, index) => {
                return (
                  <li key={index} className="pt-2">
                    <Skeleton className="h-[30px]" />
                  </li>
                );
              })}

            {filteredSystemFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
              <SystemSidebarItem
                key={namespace}
                name={namespace}
                isNamespace
                isExpanded={expandedSystems[namespace]}
                onToggle={() => toggleSystem(namespace)}
                functionCount={systems.reduce((total, system) => total + system.functions.length, 0)}
              >
                <ul className="ml-4 space-y-1">
                  {systems.map((system: System) => {
                    if (system.functions.length === 0) return null;

                    const isExpanded = expandedSystems[system.systemId];
                    return (
                      <SystemSidebarItem
                        key={system.systemId}
                        name={system.name}
                        isExpanded={isExpanded}
                        onToggle={() => toggleSystem(system.systemId)}
                        functionCount={system.functions.length}
                      >
                        <ul className="mt-0 space-y-1">
                          {system.functions.map((abi: AbiFunction) => (
                            <FunctionSidebarItem key={toFunctionHash(abi)} abi={abi} hash={hash} />
                          ))}
                        </ul>
                      </SystemSidebarItem>
                    );
                  })}
                </ul>
              </SystemSidebarItem>
            ))}

            {filteredSystemFunctions.core.map((system: System) => {
              if (system.functions.length === 0) return null;

              const isExpanded = expandedSystems[system.systemId];
              return (
                <SystemSidebarItem
                  key={system.systemId}
                  name={system.name}
                  isExpanded={isExpanded}
                  onToggle={() => toggleSystem(system.systemId)}
                  functionCount={system.functions.length}
                >
                  <ul className="mt-0 space-y-1">
                    {system.functions.map((abi: AbiFunction) => (
                      <FunctionSidebarItem key={toFunctionHash(abi)} abi={abi} hash={hash} />
                    ))}
                  </ul>
                </SystemSidebarItem>
              );
            })}
          </ul>
        </div>

        <div className="w-full overflow-y-auto pl-1 pr-1">
          {!isFetched && (
            <div className="space-y-4">
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[150px]" />
            </div>
          )}

          {data?.abi && (
            <>
              {filteredSystemFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
                <SystemContent
                  key={namespace}
                  name={namespace}
                  systems={systems}
                  worldAbi={data.abi as AbiItem[]}
                  isNamespace
                />
              ))}

              {filteredSystemFunctions.core.map((system: System) => (
                <SystemContent
                  key={system.systemId}
                  name={system.name}
                  functions={system.functions}
                  worldAbi={data.abi as AbiItem[]}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
