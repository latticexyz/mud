import { Abi, AbiStateMutability, ContractFunctionName, ContractFunctionParameters } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, mutability, functionName>, "abi">[]
): ContractFunctionParameters<typeof IWorldCallAbi, "nonpayable", "call">["args"][] {
  return systemCalls.map((systemCall) =>
    encodeSystemCall({ ...systemCall, abi } as SystemCall<abi, mutability, functionName>)
  );
}
