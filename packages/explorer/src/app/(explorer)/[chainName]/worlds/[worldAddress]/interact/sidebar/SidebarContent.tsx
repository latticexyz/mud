import { useRouter, useSearchParams } from "next/navigation";
import { toFunctionHash } from "viem";
import { useEffect } from "react";
import { Skeleton } from "../../../../../../../components/ui/Skeleton";
import { FilteredFunctions } from "../InteractForm";
import { FunctionSidebarItem } from "./FunctionSidebarItem";
import { SystemSidebarItem } from "./SystemSidebarItem";

type Props = {
  filteredFunctions: FilteredFunctions;
  filterValue: string;
  isLoading: boolean;
  expanded: string[];
  onToggleExpanded: (name: string) => void;
};

export function SidebarContent({ filteredFunctions, filterValue, isLoading, expanded, onToggleExpanded }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterValue) {
      params.set("filter", filterValue);
    } else {
      params.delete("filter");
    }
    router.replace(`?${params.toString()}${window.location.hash}`);
  }, [filterValue, searchParams, router]);

  return (
    <ul className="py-4 pr-4">
      {isLoading &&
        Array.from({ length: 6 }).map((_, index) => {
          return (
            <li key={index} className="pt-2">
              <Skeleton className="h-[30px]" />
            </li>
          );
        })}

      {!isLoading && (
        <>
          {filteredFunctions.namespaces.map(({ namespace, systems }) => (
            <SystemSidebarItem
              key={namespace}
              name={namespace}
              isNamespace
              isExpanded={expanded.includes(namespace)}
              onToggleExpanded={onToggleExpanded}
            >
              <ul className="pl-4">
                {systems.map((system) => (
                  <SystemSidebarItem
                    key={system.systemId}
                    name={system.name}
                    functionCount={system.functions.length}
                    isExpanded={expanded.includes(system.systemId)}
                    onToggleExpanded={onToggleExpanded}
                  >
                    <ul className="space-y-1 py-1">
                      {system.functions.map((abi) => (
                        <FunctionSidebarItem key={toFunctionHash(abi)} systemId={system.systemId} abi={abi} />
                      ))}
                    </ul>
                  </SystemSidebarItem>
                ))}
              </ul>
            </SystemSidebarItem>
          ))}

          {filteredFunctions.core.map((system) => (
            <SystemSidebarItem
              key={system.systemId}
              name={system.name}
              functionCount={system.functions.length}
              isExpanded={expanded.includes(system.systemId)}
              onToggleExpanded={onToggleExpanded}
            >
              <ul>
                {system.functions.map((abi) => (
                  <FunctionSidebarItem key={toFunctionHash(abi)} systemId={system.systemId} abi={abi} />
                ))}
              </ul>
            </SystemSidebarItem>
          ))}
        </>
      )}
    </ul>
  );
}
