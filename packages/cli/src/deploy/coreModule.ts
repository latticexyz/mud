import coreModuleBuild from "@latticexyz/world/out/CoreModule.sol/CoreModule.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Address, Hex, getCreate2Address, encodeDeployData } from "viem";
import { ensureContract } from "./ensureContract";
import { salt } from "./common";
import { deployer } from "./deployer";

const bytecode = encodeDeployData({
  bytecode: coreModuleBuild.bytecode.object as Hex,
  abi: [],
});

export const coreModule = getCreate2Address({ from: deployer, bytecode, salt });

export async function ensureCoreModule(client: Client<Transport, Chain | undefined, Account>): Promise<Address> {
  console.log("ensuring core module");
  return await ensureContract(client, bytecode);
}
