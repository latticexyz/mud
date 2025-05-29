import { Abi, AbiItem } from "viem";
import { Skeleton } from "../../../../../../../components/ui/Skeleton";
import { FilteredFunctions, NamespaceSection, System } from "../InteractForm";
import { SystemContent } from "./SystemContent";

type Props = {
  worldAbi?: Abi;
  filteredFunctions: FilteredFunctions;
  filterValue: string;
  isLoading: boolean;
};

export function FunctionsContent({ worldAbi, filteredFunctions, isLoading }: Props) {
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
              isNamespace
            />
          ))}

          {filteredFunctions.core.map((system: System) => (
            <SystemContent
              key={system.systemId}
              name={system.name}
              functions={system.functions}
              worldAbi={worldAbi as AbiItem[]}
            />
          ))}
        </>
      )}
    </div>
  );
}
