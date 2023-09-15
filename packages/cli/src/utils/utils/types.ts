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

export type TxConfig = {
  signer: ethers.Wallet;
  maxPriorityFeePerGas: number | undefined;
  maxFeePerGas: BigNumber | undefined;
  gasPrice: BigNumber | undefined;
  debug: boolean;
  confirmations: number;
};
