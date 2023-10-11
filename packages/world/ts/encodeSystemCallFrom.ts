import { Abi, EncodeFunctionDataParameters, GetFunctionArgs, encodeFunctionData, Address } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCall } from "./encodeSystemCall";

export type SystemCallFrom<abi extends Abi, functionName extends string = string> = SystemCall<abi, functionName> & {
  readonly from: Address;
};

/** Encode a system call to be passed as arguments into `World.callFrom` */
export function encodeSystemCallFrom<abi extends Abi, functionName extends string = string>({
  abi,
  from,
  systemId,
  functionName,
  args,
}: SystemCallFrom<abi, functionName>): GetFunctionArgs<typeof IWorldCallAbi, "callFrom">["args"] {
  return [
    from,
    systemId,
    encodeFunctionData({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
