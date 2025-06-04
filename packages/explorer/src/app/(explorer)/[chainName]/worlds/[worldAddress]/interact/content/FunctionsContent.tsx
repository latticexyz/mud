import { Abi, AbiItem } from "viem";
import { useRef } from "react";
import { Skeleton } from "../../../../../../../components/ui/Skeleton";
import { FilteredFunctions, NamespaceSection, System } from "../InteractForm";
import { SystemContent } from "./SystemContent";

type Props = {
  filteredFunctions: FilteredFunctions;
  isLoading: boolean;
  worldAbi?: Abi;
};

export function FunctionsContent({ worldAbi, filteredFunctions, isLoading }: Props) {
  const initialFunctionHash = useRef(window.location.hash.slice(1)).current;
  return (
    <div className="w-full overflow-y-auto pl-1 pr-1">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      )}

      {!isLoading && (
        <>
          {filteredFunctions.namespaces.map(({ namespace, systems }: NamespaceSection) => (
            <SystemContent
              key={namespace}
              name={namespace}
              systems={systems}
              worldAbi={worldAbi as AbiItem[]}
              initialFunctionHash={initialFunctionHash}
              isNamespace
            />
          ))}

          {filteredFunctions.core.map((system: System) => (
            <SystemContent
              key={system.systemId}
              name={system.name}
              functions={system.functions}
              worldAbi={worldAbi as AbiItem[]}
              initialFunctionHash={initialFunctionHash}
            />
          ))}
        </>
      )}
    </div>
  );
}
