import chalk from "chalk";
import { Contract } from "ethers";
import CoreModuleData from "@latticexyz/world/abi/CoreModule.sol/CoreModule.json" assert { type: "json" };
import { TxHelper } from "./txHelper";

export class CoreModule {
  coreModulePromise: Promise<string> | undefined;

  constructor(
    private config: {
      txHelper: TxHelper;
      disableTxWait: boolean;
    }
  ) {}

  async deployContracts(): Promise<void> {
    console.log(chalk.blue(`Deploying CoreModule`));
    // TODO: these only need to be deployed once per chain, add a check if they exist already (use create2)
    this.coreModulePromise = this.config.txHelper.deployContract(
      CoreModuleData.abi,
      CoreModuleData.bytecode,
      this.config.disableTxWait,
      "CoreModule"
    );
  }

  async install(worldContract: Contract): Promise<void> {
    const confirmations = this.config.disableTxWait ? 0 : 1;
    console.log(chalk.blue("Installing CoreModule"));
    await this.config.txHelper.fastTxExecute(
      worldContract,
      "installRootModule",
      [await this.coreModulePromise, "0x"],
      confirmations
    );
    console.log(chalk.green("Installed CoreModule"));
  }
}
