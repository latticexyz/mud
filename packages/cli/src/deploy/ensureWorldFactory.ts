import coreModuleBuild from "@latticexyz/world/out/CoreModule.sol/CoreModule.json" assert { type: "json" };
import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Hex, parseAbi, getCreate2Address, encodeDeployData } from "viem";
import { deployer } from "./ensureDeployer";
import { salt } from "./common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";

const coreModuleBytecode = encodeDeployData({
  bytecode: coreModuleBuild.bytecode.object as Hex,
  abi: [],
});

const coreModule = getCreate2Address({ from: deployer, bytecode: coreModuleBytecode, salt });

const worldFactoryBytecode = encodeDeployData({
  bytecode: worldFactoryBuild.bytecode.object as Hex,
  abi: parseAbi(["constructor(address)"]),
  args: [coreModule],
});

export const worldFactory = getCreate2Address({ from: deployer, bytecode: worldFactoryBytecode, salt });

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>
): Promise<readonly Hex[]> {
  // WorldFactory constructor doesn't call CoreModule, only sets its address, so we can do these in parallel since the address is deterministic
  return await ensureContractsDeployed({
    client,
    contracts: [
      { bytecode: coreModuleBytecode, label: "core module" },
      { bytecode: worldFactoryBytecode, label: "world factory" },
    ],
  });
}
