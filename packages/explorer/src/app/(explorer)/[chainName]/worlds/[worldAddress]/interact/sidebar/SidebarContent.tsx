import { useRouter, useSearchParams } from "next/navigation";
import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useEffect, useState } from "react";
import { hexToResource } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Skeleton } from "../../../../../../../components/ui/Skeleton";
import { useHashState } from "../../../../../hooks/useHashState";
import { useSystemAbisQuery } from "../../../../../queries/useSystemAbisQuery";
import { FilteredFunctions, NamespaceSection, System } from "../InteractForm";
import { FunctionSidebarItem } from "./FunctionSidebarItem";
import { SystemSidebarItem } from "./SystemSidebarItem";

type Props = {
  filteredFunctions: FilteredFunctions;
  filterValue: string;
  isLoading: boolean;
};

export function SidebarContent({ filterValue, filteredFunctions, isLoading }: Props) {
  const { data: systemData } = useSystemAbisQuery();
  const [hash] = useHashState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({
    root: true,
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterValue) {
      params.set("filter", filterValue);
    } else {
      params.delete("filter");
    }
    router.replace(`?${params.toString()}`);
  }, [filterValue, searchParams, router]);

  const toggleSystem = (systemId: string) => {
    setExpandedSystems((prev) => {
      const newState = { ...prev };
      const isExpanding = !prev[systemId];

      if (isExpanding === false) {
        const namespace = systemId;
        const systems = filteredFunctions.namespaces.find((ns) => ns.namespace === namespace)?.systems || [];
        systems.forEach((system) => {
          newState[system.systemId] = false;
        });
      }

      newState[systemId] = isExpanding;
      return newState;
    });
  };

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

  // Expand matching systems when the filter value is changed
  useEffect(() => {
    if (!filterValue) {
      setExpandedSystems({ root: true });
      return;
    }

    const newExpandedState: Record<string, boolean> = {};

    if (filteredFunctions.core.length > 0) {
      newExpandedState.core = true;
    }

    filteredFunctions.namespaces.forEach(({ namespace, systems }) => {
      if (systems.length > 0) {
        newExpandedState[namespace] = true;
        systems.forEach((system) => {
          newExpandedState[system.systemId] = true;
        });
      }
    });

    setExpandedSystems(newExpandedState);
  }, [filterValue, filteredFunctions]);

  return (
    <ul className="mt-4 max-h-max overflow-y-auto pb-4 pr-4">
      {isLoading &&
        Array.from({ length: 6 }).map((_, index) => {
          return (
            <li key={index} className="pt-2">
              <Skeleton className="h-[30px]" />
            </li>
          );
        })}

      {filteredFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
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

      {filteredFunctions.core.map((system: System) => {
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
  );
}
