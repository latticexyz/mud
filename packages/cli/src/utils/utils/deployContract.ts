import chalk from "chalk";
import { ethers } from "ethers";
import { MUDError } from "@latticexyz/common/errors";
import { TxConfig, ContractCode } from "./types";

export async function deployContract(input: TxConfig & { nonce: number; contract: ContractCode }): Promise<string> {
  const { signer, nonce, maxPriorityFeePerGas, maxFeePerGas, debug, gasPrice, confirmations, contract } = input;

  try {
    const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);
    console.log(chalk.gray(`executing deployment of ${contract.name} with nonce ${nonce}`));
    const deployPromise = factory
      .deploy({
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasPrice,
      })
      .then((c) => (confirmations ? c : c.deployed()));
    const { address } = await deployPromise;
    console.log(chalk.green("Deployed", contract.name, "to", address));
    return address;
  } catch (error: any) {
    if (debug) console.error(error);
    if (error?.message.includes("invalid bytecode")) {
      throw new MUDError(
        `Error deploying ${contract.name}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
      );
    } else if (error?.message.includes("getContractLimit")) {
      throw new MUDError(`Error deploying ${contract.name}: getContractLimit exceeded.`);
    } else throw error;
  }
}
