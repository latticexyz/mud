import { BigNumber, ContractInterface, ethers } from "ethers";

export type CallData = {
  func: string;
  args: unknown[];
};

export type ContractCode = {
  name: string;
  abi: ContractInterface;
  bytecode: string | { object: string };
};
