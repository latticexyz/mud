import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Address, Hex, parseAbi, getCreate2Address, encodeDeployData } from "viem";
import { coreModule, ensureCoreModule } from "./coreModule";
import { ensureContract } from "./ensureContract";
import { deployer } from "./deployer";
import { salt } from "./common";

const bytecode = encodeDeployData({
  bytecode: worldFactoryBuild.bytecode.object as Hex,
  abi: parseAbi(["constructor(address)"]),
  args: [coreModule],
});

export const worldFactory = getCreate2Address({ from: deployer, bytecode, salt });

export async function ensureWorldFactory(client: Client<Transport, Chain | undefined, Account>): Promise<Address> {
  await ensureCoreModule(client);
  console.log("ensuring world factory");
  return await ensureContract(client, bytecode);
}
