import { Abi, Address, AbiStateMutability, ContractFunctionName, ContractFunctionParameters } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCallFrom, encodeSystemCallFrom } from "./encodeSystemCallFrom";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<
  abi extends Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>
>(
  abi: abi,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, mutability, functionName>, "abi" | "from">[]
): ContractFunctionParameters<typeof IWorldCallAbi, "nonpayable", "callFrom">["args"][] {
  return systemCalls.map((systemCall) =>
    encodeSystemCallFrom({ ...systemCall, abi, from } as SystemCallFrom<abi, mutability, functionName>)
  );
}
