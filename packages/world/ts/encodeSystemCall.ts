import {
  Abi,
  EncodeFunctionDataParameters,
  ContractFunctionParameters,
  Hex,
  encodeFunctionData,
  AbiStateMutability,
  ContractFunctionName,
} from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";

export type SystemCall<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
> = Pick<ContractFunctionParameters<abi, mutability, functionName>, "abi" | "functionName" | "args"> & {
  readonly systemId: Hex;
};

/** Encode a system call to be passed as arguments into `World.call` */
export function encodeSystemCall<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
>({
  abi,
  systemId,
  functionName,
  args,
}: SystemCall<abi, mutability, functionName>): ContractFunctionParameters<
  typeof IWorldCallAbi,
  "nonpayable",
  "call"
>["args"] {
  return [
    systemId,
    encodeFunctionData<abi, functionName>({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
