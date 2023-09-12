import chalk from "chalk";
import { TxConfig, deployContract, deployContractByName } from "./txHelpers";

import WorldData from "@latticexyz/world/abi/World.sol/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };

export async function deployWorldContract(
  ip: TxConfig & { worldAddress: string | undefined; worldContractName: string | undefined; forgeOutDirectory: string }
): Promise<string> {
  console.log(chalk.blue(`Deploying World`));
  /* 
    Config allows:
    - existing worldAddress to be passed
    - world contract name to be passed
    Or deploy from base contract by default
    (Will also check create2 deployment here in future)
    */
  return ip.worldAddress
    ? Promise.resolve(ip.worldAddress)
    : ip.worldContractName
    ? deployContractByName({ ...ip, contractName: ip.worldContractName })
    : deployContract({
        ...ip,
        contract: { abi: IBaseWorldData.abi, bytecode: WorldData.bytecode, name: "World" },
      });
}
