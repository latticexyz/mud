import { Abi } from "viem";

export type CallData = {
  func: string;
  args: unknown[];
};

export type ContractCode = {
  name: string;
  abi: Abi;
  bytecode: string | { object: string };
};
