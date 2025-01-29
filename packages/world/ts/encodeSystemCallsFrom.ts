import { Abi, Address, EncodeFunctionDataParameters, encodeFunctionData, type ContractFunctionName } from "viem";
import { SystemCallFrom } from "./encodeSystemCallFrom";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[],
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "batchCallFrom">["inputs"]> {
  return [
    systemCalls.map(({ systemId, functionName, args }) => ({
      from,
      systemId,
      callData: encodeFunctionData<abi, functionName>({
        abi,
        functionName,
        args,
      } as EncodeFunctionDataParameters<abi, functionName>),
    })),
  ];
}
