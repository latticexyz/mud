import chalk from "chalk";
import { Account, Address, Abi, Client, Hex } from "viem";
import WorldData from "@latticexyz/world/out/World.sol/World.json" assert { type: "json" };
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { deployContract } from "./utils/deployContract";
import { getContractData } from "./utils/getContractData";

export async function deployWorldContract({
  worldContractName,
  forgeOutDirectory,
  client,
  account,
  debug,
  nonce,
}: {
  worldContractName: string | undefined;
  forgeOutDirectory: string;
  client: Client;
  account: Account | Address;
  debug: boolean;
  nonce: number;
}): Promise<Hex> {
  console.log(chalk.blue(`Deploying World`));
  const contractData = worldContractName
    ? {
        name: "World",
        ...getContractData(worldContractName, forgeOutDirectory),
      }
    : { abi: IBaseWorldAbi as Abi, bytecode: WorldData.bytecode, name: "World" };
  return deployContract({
    contract: contractData,
    client,
    account,
    debug: Boolean(debug),
    nonce,
  });
}
