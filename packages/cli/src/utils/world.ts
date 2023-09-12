import chalk from "chalk";
import { TxConfig, deployContract, getContractData } from "./txHelpers";

import WorldData from "@latticexyz/world/abi/World.sol/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };

export async function deployWorldContract(
  ip: TxConfig & {
    nonce: number;
    worldContractName: string | undefined;
    forgeOutDirectory: string;
  }
): Promise<string> {
  console.log(chalk.blue(`Deploying World`));
  const contractData = ip.worldContractName
    ? {
        name: "World",
        ...getContractData(ip.worldContractName, ip.forgeOutDirectory),
      }
    : { abi: IBaseWorldData.abi, bytecode: WorldData.bytecode, name: "World" };
  return deployContract({
    ...ip,
    nonce: ip.nonce,
    contract: contractData,
  });
}
