import { useRouter, useSearchParams } from "next/navigation";
import { toFunctionHash } from "viem";
import { useEffect } from "react";
import { FilteredFunctions } from "../InteractForm";
import { FunctionSidebarItem } from "./FunctionSidebarItem";
import { SystemSidebarItem } from "./SystemSidebarItem";

type Props = {
  filteredFunctions: FilteredFunctions;
  filterValue: string;
  isLoading: boolean;
};

export function SidebarContent({ filteredFunctions, filterValue }: Props) {
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
    <ul className="space-y-1 pr-2">
      {filteredFunctions.namespaces.map(({ namespace, systems }) => (
        <SystemSidebarItem key={namespace} name={namespace} isNamespace>
          <ul className="space-y-2 pl-4">
            {systems.map((system) => (
              <SystemSidebarItem key={system.systemId} name={system.name} functionCount={system.functions.length}>
                <ul className="space-y-2">
                  {system.functions.map((abi) => (
                    <FunctionSidebarItem key={toFunctionHash(abi)} abi={abi} />
                  ))}
                </ul>
              </SystemSidebarItem>
            ))}
          </ul>
        </SystemSidebarItem>
      ))}

      {filteredFunctions.core.map((system) => (
        <SystemSidebarItem key={system.systemId} name={system.name} functionCount={system.functions.length}>
          <ul className="space-y-1">
            {system.functions.map((abi) => (
              <FunctionSidebarItem key={toFunctionHash(abi)} abi={abi} />
            ))}
          </ul>
        </SystemSidebarItem>
      ))}
    </ul>
  );
}
