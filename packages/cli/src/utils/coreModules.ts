import chalk from "chalk";
import { Contract } from "ethers";
import { TxHelper } from "./txHelper";

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
