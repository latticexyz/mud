import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { defaultAbiCoder as abi } from "ethers/lib/utils.js";
import { resolveWithContext } from "@latticexyz/config";
import { TableIds } from "./world";
import { TxConfig, fastTxExecute } from "./txHelpers";

type ModuleConfig = {
  name: string;
  root: boolean;
  args: (
    | {
        value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        type: string;
      }
    | {
        type: any;
        input: string;
      }
  )[];
}[];

export function getUserModules(defaultModules: { name: string }[], configModules: ModuleConfig): ModuleConfig {
  return configModules.filter((module) => !defaultModules.some((m) => m.name === module.name));
}

export async function installModules(
  input: TxConfig & {
    worldContract: Contract;
    modules: ModuleConfig;
    moduleContracts: Record<string, Promise<string>>;
    tableIds: TableIds;
  }
): Promise<number> {
  console.log(chalk.blue("Installing Modules"));
  const { confirmations, worldContract, modules, moduleContracts, tableIds } = input;
  // Install modules - non-blocking for tx, await all at end
  const modulePromisesNew: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const module of modules) {
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
    const moduleAddress = await moduleContracts[module.name];
    if (!moduleAddress) throw new Error(`Module ${module.name} not found`);

    // Send transaction to install module
    modulePromisesNew.push(
      fastTxExecute({
        ...input,
        nonce: input.nonce++,
        contract: worldContract,
        func: module.root ? "installRootModule" : "installModule",
        args: [moduleAddress, abi.encode(types, values)],
        confirmations,
      })
    );
  }
  await Promise.all(modulePromisesNew);
  console.log(chalk.green(`Modules Installed`));
  return input.nonce;
}
