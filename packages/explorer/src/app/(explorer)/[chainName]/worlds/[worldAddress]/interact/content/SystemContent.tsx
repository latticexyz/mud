import { AbiFunction, AbiItem, toFunctionHash } from "viem";
import { Badge } from "../../../../../../../components/ui/Badge";
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
  if (isNamespace && systems) {
    return (
      <div>
        <h4 className="mt-4 text-4xl font-semibold opacity-50">{name}</h4>
        {systems.map((system) => (
          <div key={system.systemId}>
            <div className="mb-2 flex items-center gap-4">
              <h4 className="my-4 text-2xl font-semibold">{system.name}</h4>
              <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                {system.functions.length}
              </Badge>
            </div>
            {system.functions.map((abi: AbiFunction) => (
              <FunctionField key={toFunctionHash(abi)} worldAbi={worldAbi} functionAbi={abi} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (functions) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h4 className="my-4 text-2xl font-semibold">{name}</h4>
          <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
            {functions.length}
          </Badge>
        </div>
        {functions.map((abi: AbiFunction) => (
          <FunctionField key={toFunctionHash(abi)} worldAbi={worldAbi} functionAbi={abi} />
        ))}
      </div>
    );
  }

  return null;
}
