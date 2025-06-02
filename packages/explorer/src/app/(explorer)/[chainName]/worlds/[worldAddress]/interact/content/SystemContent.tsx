import { ChevronsUpDown } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
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
  defaultExpanded?: boolean;
};

export function SystemContent({
  name,
  systems,
  functions,
  worldAbi,
  isNamespace,
  initialFunctionHash,
  defaultExpanded = false,
}: SystemContentProps) {
  const [isExpanded, setIsExpanded] = useQueryState(
    "expanded",
    parseAsArrayOf(parseAsString).withDefault(defaultExpanded ? [name] : []),
  );

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }
      return [...prev, name];
    });
  };

  if (isNamespace && systems) {
    return (
      <div>
        <Collapsible open={isExpanded.includes(name)} onOpenChange={handleToggleExpanded}>
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
        <Collapsible open={isExpanded.includes(name)} onOpenChange={handleToggleExpanded}>
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
