import chalk from "chalk";
import { WalletClient, PublicClient, Account, Address, Abi } from "viem";
import WorldData from "@latticexyz/world/out/World.sol/World.json" assert { type: "json" };
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { deployContract } from "./utils/deployContract";
import { getContractData } from "./utils/getContractData";

export async function deployWorldContract(ip: {
  worldContractName: string | undefined;
  forgeOutDirectory: string;
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Account | Address;
  debug: boolean;
  nonce: number;
}): Promise<string> {
  const { worldContractName, forgeOutDirectory, walletClient, publicClient, account, debug, nonce } = ip;
  console.log(chalk.blue(`Deploying World`));
  const contractData = worldContractName
    ? {
        name: "World",
        ...getContractData(worldContractName, forgeOutDirectory),
      }
    : { abi: IBaseWorldAbi as Abi, bytecode: WorldData.bytecode, name: "World" };
  return deployContract({
    contract: contractData,
    walletClient,
    publicClient,
    account,
    debug: Boolean(debug),
    nonce,
  });
}
