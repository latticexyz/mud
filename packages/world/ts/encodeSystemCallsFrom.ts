import { Abi, Address, EncodeFunctionDataParameters, encodeFunctionData, type ContractFunctionName } from "viem";
import { SystemCallFrom } from "./encodeSystemCallFrom";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";
import { internal_normalizeSystemFunctionName } from "./normalizeSystemFunctionName";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "from">[],
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "batchCallFrom">["inputs"]> {
  return [
    systemCalls.map(({ abi, systemId, functionName, args }) => ({
      from,
      systemId,
      callData: encodeFunctionData<abi, functionName>({
        abi,
        functionName: internal_normalizeSystemFunctionName(systemId, functionName),
        args,
      } as EncodeFunctionDataParameters<abi, functionName>),
    })),
  ];
}
