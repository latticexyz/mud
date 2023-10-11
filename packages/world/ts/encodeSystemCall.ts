import {
  Abi,
  EncodeFunctionDataParameters,
  ContractFunctionConfig,
  GetFunctionArgs,
  Hex,
  encodeFunctionData,
} from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";

export type SystemCall<abi extends Abi, functionName extends string = string> = Pick<
  ContractFunctionConfig<abi, functionName>,
  "abi" | "functionName" | "args"
> & {
  readonly systemId: Hex;
};

/** Encode a system call to be passed as arguments into `World.call` */
export function encodeSystemCall<abi extends Abi, functionName extends string = string>({
  abi,
  systemId,
  functionName,
  args,
}: SystemCall<abi, functionName>): GetFunctionArgs<typeof IWorldCallAbi, "call">["args"] {
  return [
    systemId,
    encodeFunctionData({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
