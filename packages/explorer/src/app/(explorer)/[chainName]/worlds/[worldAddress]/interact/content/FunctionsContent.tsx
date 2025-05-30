import { Abi, AbiItem } from "viem";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "../../../../../../../components/ui/Skeleton";
import { FilteredFunctions } from "../InteractForm";
import { SystemContent } from "./SystemContent";

type Props = {
  worldAbi?: Abi;
  filteredFunctions: FilteredFunctions;
  filterValue: string;
  isLoading: boolean;
};

export function FunctionsContent({ worldAbi, filteredFunctions, isLoading }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all functions into a single array for virtualization
  const allItems = [
    ...filteredFunctions.namespaces.flatMap(({ namespace, systems }) => [
      { type: "namespace" as const, namespace },
      ...systems.map((system) => ({
        type: "system" as const,
        namespace,
        system,
      })),
    ]),
    ...filteredFunctions.core.map((system) => ({
      type: "system" as const,
      namespace: "core",
      system,
    })),
  ];

  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Approximate height of a system section
    overscan: 5, // Number of items to render outside of the visible area
  });

  console.log("allItems", allItems);
  console.log("virtualizer", virtualizer.getVirtualItems());
  console.log("total height", virtualizer.getTotalSize());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[150px]" />
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
      <div
        className="relative h-full w-full overflow-auto"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = allItems[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.type === "namespace" ? (
                <SystemContent
                  key={item.namespace}
                  name={item.namespace}
                  systems={[]}
                  worldAbi={worldAbi as AbiItem[]}
                  isNamespace
                />
              ) : (
                <SystemContent
                  key={item.system.systemId}
                  name={item.system.name}
                  functions={item.system.functions}
                  worldAbi={worldAbi as AbiItem[]}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
