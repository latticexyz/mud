import chalk from "chalk";
import { Contract } from "ethers";
import { TxConfig, fastTxExecute } from "../txHelpers";

export async function installCoreModule(
  input: TxConfig & { worldContract: Contract; coreModuleAddress: string }
): Promise<number> {
  console.log(chalk.blue("Installing CoreModule"));
  const { worldContract, coreModuleAddress } = input;
  await fastTxExecute({
    ...input,
    nonce: input.nonce++,
    contract: worldContract,
    func: "installRootModule",
    args: [coreModuleAddress, "0x"],
  });
  console.log(chalk.green("Installed CoreModule"));
  return input.nonce;
}
