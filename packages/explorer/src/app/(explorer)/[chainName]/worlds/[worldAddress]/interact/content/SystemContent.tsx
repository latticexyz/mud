import { ChevronsUpDown } from "lucide-react";
import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useState } from "react";
import { Button } from "../../../../../../../components/ui/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../../../components/ui/Collapsible";
import { FunctionField } from "./FunctionField";

type System = {
  systemId: string;
  name: string;
  namespace: string;
  functions: AbiFunction[];
};

type SystemContentProps = {
  name: string;
  systems?: System[];
  functions?: AbiFunction[];
  worldAbi: AbiItem[];
  isNamespace?: boolean;
  initialFunctionHash?: string;
};

export function SystemContent({
  name,
  systems,
  functions,
  worldAbi,
  isNamespace,
  initialFunctionHash,
}: SystemContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isNamespace && systems) {
    return (
      <div>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="group flex w-full cursor-pointer items-center justify-between">
              <h4 className="mt-4 text-2xl font-semibold">{name}</h4>
              <Button size="sm" variant="ghost">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {systems.map((system) => (
              <div key={system.systemId}>
                <h4 className="my-4 text-xl font-semibold opacity-70">{system.name}</h4>
                {system.functions.map((abi: AbiFunction) => (
                  <FunctionField
                    key={toFunctionHash(abi)}
                    systemId={system.systemId as Hex}
                    worldAbi={worldAbi}
                    functionAbi={abi}
                    isSelected={initialFunctionHash === toFunctionHash(abi)}
                  />
                ))}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  if (functions) {
    return (
      <div>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="group flex w-full cursor-pointer items-center justify-between">
              <h4 className="my-4 text-2xl font-semibold">{name}</h4>
              <Button size="sm" variant="ghost">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {functions.map((abi: AbiFunction) => (
              <FunctionField
                key={toFunctionHash(abi)}
                worldAbi={worldAbi}
                functionAbi={abi}
                isSelected={initialFunctionHash === toFunctionHash(abi)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return null;
}
