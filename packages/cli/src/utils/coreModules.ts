import chalk from "chalk";
import { Contract } from "ethers";
import { TxHelper } from "./txHelper";
import CoreModuleData from "@latticexyz/world/abi/CoreModule.sol/CoreModule.json" assert { type: "json" };

export async function deployCoreModuleContracts(txHelper: TxHelper, disableTxWait: boolean): Promise<string> {
  console.log(chalk.blue(`Deploying CoreModule`));
  // TODO: these only need to be deployed once per chain, add a check if they exist already (use create2)
  return txHelper.deployContract(CoreModuleData.abi, CoreModuleData.bytecode, disableTxWait, "CoreModule");
}

export async function installCoreModule(
  worldContract: Contract,
  coreModuleAddress: string,
  disableTxWait: boolean,
  txHelper: TxHelper
): Promise<void> {
  const confirmations = disableTxWait ? 0 : 1;
  console.log(chalk.blue("Installing CoreModule"));
  await txHelper.fastTxExecute(worldContract, "installRootModule", [coreModuleAddress, "0x"], confirmations);
  console.log(chalk.green("Installed CoreModule"));
}
