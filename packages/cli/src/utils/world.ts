import chalk from "chalk";
import { TxConfig, deployContract, getContractData } from "./utils";

import WorldData from "@latticexyz/world/out/World.sol/World.json" assert { type: "json" };
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };

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
    : { abi: IBaseWorldAbi, bytecode: WorldData.bytecode, name: "World" };
  return deployContract({
    ...ip,
    nonce: ip.nonce,
    contract: contractData,
  });
}
