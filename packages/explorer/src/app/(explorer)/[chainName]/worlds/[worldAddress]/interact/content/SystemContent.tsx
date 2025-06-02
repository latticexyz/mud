import { AbiFunction, AbiItem, Hex, toFunctionHash } from "viem";
import { useRef } from "react";
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
};

export function SystemContent({ name, systems, functions, worldAbi, isNamespace }: SystemContentProps) {
  const currentHash = useRef(window.location.hash.slice(1)).current;

  if (isNamespace && systems) {
    return (
      <div>
        <h4 className="mt-4 text-4xl font-semibold opacity-50">{name}</h4>
        {systems.map((system) => (
          <div key={system.systemId}>
            <h4 className="my-4 text-2xl font-semibold">{system.name}</h4>
            {system.functions.map((abi: AbiFunction) => (
              <FunctionField
                key={toFunctionHash(abi)}
                systemId={system.systemId as Hex}
                worldAbi={worldAbi}
                functionAbi={abi}
                isSelected={currentHash === toFunctionHash(abi)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (functions) {
    return (
      <div>
        <h4 className="my-4 text-2xl font-semibold">{name}</h4>
        {functions.map((abi: AbiFunction) => (
          <FunctionField
            key={toFunctionHash(abi)}
            worldAbi={worldAbi}
            functionAbi={abi}
            isSelected={currentHash === toFunctionHash(abi)}
          />
        ))}
      </div>
    );
  }

  return null;
}
