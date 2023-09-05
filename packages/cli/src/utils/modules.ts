import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { defaultAbiCoder as abi } from "ethers/lib/utils.js";
import { resolveWithContext } from "@latticexyz/config";
import { TableIds } from "./world";
import { TxHelper } from "./txHelper";
import KeysWithValueModuleData from "@latticexyz/world/abi/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world/abi/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world/abi/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };

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

export function deployModuleContracts(
  txHelper: TxHelper,
  disableTxWait: boolean,
  modules: ModuleConfig
): Record<string, Promise<string>> {
  // Deploy Systems - can check via Create2 in future

  // Deploy default World modules
  const defaultModules: Record<string, Promise<string>> = {
    KeysWithValueModule: txHelper.deployContract(
      KeysWithValueModuleData.abi,
      KeysWithValueModuleData.bytecode,
      disableTxWait,
      "KeysWithValueModule"
    ),
    KeysInTableModule: txHelper.deployContract(
      KeysInTableModuleData.abi,
      KeysInTableModuleData.bytecode,
      disableTxWait,
      "KeysInTableModule"
    ),
    UniqueEntityModule: txHelper.deployContract(
      UniqueEntityModuleData.abi,
      UniqueEntityModuleData.bytecode,
      disableTxWait,
      "UniqueEntityModule"
    ),
  };
  // Only deploy user modules here, not default modules
  return modules
    .filter((module) => !defaultModules[module.name])
    .reduce<Record<string, Promise<string>>>((acc, module) => {
      acc[module.name] = txHelper.deployContractByName(module.name, disableTxWait);
      return acc;
    }, defaultModules);
}

export async function installModules(
  txHelper: TxHelper,
  disableTxWait: boolean,
  worldContract: Contract,
  modules: ModuleConfig,
  tableIds: TableIds,
  moduleContracts: Record<string, Promise<string>>
): Promise<void> {
  console.log(chalk.blue("Installing Modules"));
  const confirmations = disableTxWait ? 0 : 1;
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
      txHelper.fastTxExecute(
        worldContract,
        module.root ? "installRootModule" : "installModule",
        [moduleAddress, abi.encode(types, values)],
        confirmations
      )
    );
  }
  await Promise.all(modulePromisesNew);
  console.log(chalk.green(`Modules Installed`));
}
