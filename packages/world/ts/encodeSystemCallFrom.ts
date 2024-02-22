import { Abi, EncodeFunctionDataParameters, encodeFunctionData, Address, type ContractFunctionName } from "viem";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCall } from "./encodeSystemCall";

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
  ExtractAbiFunction<typeof IWorldCallAbi, "callFrom">["inputs"]
> {
  return [
    from,
    systemId,
    encodeFunctionData({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters),
  ];
}
