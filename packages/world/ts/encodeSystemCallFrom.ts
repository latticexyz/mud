import { Abi, EncodeFunctionDataParameters, encodeFunctionData, Address, type ContractFunctionName } from "viem";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { SystemCall } from "./encodeSystemCall";
import { worldCallAbi } from "./worldCallAbi";

export type SystemCallFrom<abi extends Abi, functionName extends ContractFunctionName<abi>> = SystemCall<
  abi,
  functionName
> & {
  readonly from: Address;
};

/** Encode a system call to be passed as arguments into `World.callFrom` */
export function encodeSystemCallFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>({
  abi,
  from,
  systemId,
  functionName,
  args,
}: SystemCallFrom<abi, functionName>): AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<worldCallAbi, "callFrom">["inputs"]
> {
  return [
    from,
    systemId,
    encodeFunctionData<abi, functionName>({
      abi,
      functionName,
      args,
    } as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
