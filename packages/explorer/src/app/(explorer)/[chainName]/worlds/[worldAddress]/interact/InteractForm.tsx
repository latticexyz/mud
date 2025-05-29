"use client";

import { useSearchParams } from "next/navigation";
import { AbiFunction, AbiItem, Hex } from "viem";
import { useDeferredValue, useMemo, useState } from "react";
import { hexToResource } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Input } from "../../../../../../components/ui/Input";
import { useSystemAbisQuery } from "../../../../queries/useSystemAbisQuery";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { FunctionsContent } from "./content/FunctionsContent";
import { SidebarContent } from "./sidebar/SidebarContent";

function isFunction(abi: AbiItem): abi is AbiFunction {
  return abi.type === "function";
}

export type System = {
  systemId: string;
  name: string;
  namespace: string;
  functions: AbiFunction[];
};

export type NamespaceSection = {
  namespace: string;
  systems: System[];
};

export type FilteredFunctions = {
  core: System[];
  namespaces: NamespaceSection[];
};

export function InteractForm() {
  const searchParams = useSearchParams();
  const { data: worldAbiData, isFetched: isWorldAbiFetched } = useWorldAbiQuery();
  const { data: systemAbis, isFetched: isSystemAbisFetched } = useSystemAbisQuery();
  const isFetched = isWorldAbiFetched && isSystemAbisFetched;
  const [filterValue, setFilterValue] = useState(searchParams.get("filter") || "");
  const deferredFilterValue = useDeferredValue(filterValue);

  const filteredSystemFunctions = useMemo<FilteredFunctions>(() => {
    if (!systemAbis) return { core: [], namespaces: [] };

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

    const systemsByNamespace = Object.entries(systemAbis).reduce<Record<string, System[]>>(
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
  }, [systemAbis, deferredFilterValue]);

  return (
    <>
      <div className="-mr-1g -ml-1 flex gap-x-4 overflow-y-hidden">
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r pl-1">
          <div className="pr-4">
            <h4 className="py-4 text-xs font-semibold uppercase opacity-70">Jump to:</h4>
            <Input
              type="search"
              placeholder="Filter functions…"
              value={filterValue}
              onChange={(evt) => setFilterValue(evt.target.value)}
            />
          </div>

          <SidebarContent
            filteredFunctions={filteredSystemFunctions}
            filterValue={deferredFilterValue}
            isLoading={!isFetched}
          />
        </div>

        <FunctionsContent
          worldAbi={worldAbiData?.abi}
          filteredFunctions={filteredSystemFunctions}
          filterValue={deferredFilterValue}
          isLoading={!isFetched}
        />
      </div>
    </>
  );
}
