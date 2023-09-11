import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { TableIds } from "../world";
import { ModuleConfig } from "./types";
import { installModule } from "./installModule";
import { TxConfig } from "../txHelpers";

export async function installModules(
  input: TxConfig & {
    worldContract: Contract;
    modules: ModuleConfig;
    tableIds: TableIds;
  }
): Promise<number> {
  console.log(chalk.blue("Installing Modules"));
  const { modules } = input;
  // Install modules - non-blocking for tx, await all at end
  const modulePromisesNew: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const module of modules) {
    // Send transaction to install module
    modulePromisesNew.push(
      installModule({
        ...input,
        nonce: input.nonce++,
        module,
      })
    );
  }
  await Promise.all(modulePromisesNew);
  console.log(chalk.green(`Modules Installed`));
  return input.nonce;
}
