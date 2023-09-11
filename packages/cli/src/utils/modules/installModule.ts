import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { defaultAbiCoder as abi } from "ethers/lib/utils.js";
import { resolveWithContext } from "@latticexyz/config";
import { TableIds } from "../world";
import { Module } from "./types";
import { TxConfig, fastTxExecute } from "../txHelpers";

export async function installModule(
  input: TxConfig & {
    worldContract: Contract;
    module: Module;
    tableIds: TableIds;
  }
): Promise<TransactionResponse | TransactionReceipt> {
  const { worldContract, module, tableIds } = input;
  console.log(chalk.blue(`Installing${module.root ? " root " : " "}module ${module.name}`));
  // Resolve arguments
  const resolvedArgs = await Promise.all(
    module.args.map((arg) =>
      resolveWithContext(arg, {
        tableIds,
      })
    )
  );
  const values = resolvedArgs.map((arg) => arg.value);
  const types = resolvedArgs.map((arg) => arg.type);
  // Send transaction to install module
  return fastTxExecute({
    ...input,
    contract: worldContract,
    func: module.root ? "installRootModule" : "installModule",
    args: [module.address, abi.encode(types, values)],
  });
}
