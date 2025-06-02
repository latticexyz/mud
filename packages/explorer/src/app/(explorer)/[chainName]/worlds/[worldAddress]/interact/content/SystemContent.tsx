import { ChevronsUpDown } from "lucide-react";
import { AbiFunction, AbiItem, Hex } from "viem";
import { Button } from "../../../../../../../components/ui/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../../../components/ui/Collapsible";
import { getFunctionElementId } from "../../../../../utils/getFunctionElementId";
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
  isExpanded: boolean;
  onToggleExpanded: (name: string) => void;
};

export function SystemContent({
  name,
  systems,
  functions,
  worldAbi,
  isNamespace,
  initialFunctionHash,
  isExpanded,
  onToggleExpanded,
}: SystemContentProps) {
  if (isNamespace && systems) {
    return (
      <div>
        <Collapsible open={isExpanded} onOpenChange={() => onToggleExpanded(name)}>
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
                    key={getFunctionElementId(abi, system.systemId)}
                    systemId={system.systemId as Hex}
                    worldAbi={worldAbi}
                    functionAbi={abi}
                    useSearchParamsArgs={initialFunctionHash === getFunctionElementId(abi, system.systemId)}
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
        <Collapsible open={isExpanded} onOpenChange={() => onToggleExpanded(name)}>
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
                key={getFunctionElementId(abi)}
                worldAbi={worldAbi}
                functionAbi={abi}
                useSearchParamsArgs={initialFunctionHash === getFunctionElementId(abi)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return null;
}
