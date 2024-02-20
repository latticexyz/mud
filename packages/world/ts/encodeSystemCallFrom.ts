import {
  Abi,
  EncodeFunctionDataParameters,
  ContractFunctionName,
  encodeFunctionData,
  Address,
  AbiStateMutability,
  ContractFunctionParameters,
} from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCall } from "./encodeSystemCall";

export type SystemCallFrom<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
> = SystemCall<abi, mutability, functionName> & {
  readonly from: Address;
};

/** Encode a system call to be passed as arguments into `World.callFrom` */
export function encodeSystemCallFrom<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
>({
  abi,
  from,
  systemId,
  functionName,
  args,
}: SystemCallFrom<abi, mutability, functionName>): ContractFunctionParameters<
  typeof IWorldCallAbi,
  "nonpayable",
  "callFrom"
>["args"] {
  return [
    from,
    systemId,
    encodeFunctionData<abi, functionName>({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
