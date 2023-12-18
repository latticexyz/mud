import coreModuleBuild from "@latticexyz/world/out/CoreModule.sol/CoreModule.json" assert { type: "json" };
import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import {
  Client,
  Transport,
  Chain,
  Account,
  Hex,
  parseAbi,
  getCreate2Address,
  encodeDeployData,
  size,
  Address,
} from "viem";
import { deployerObj } from "./ensureDeployer";
import { salt } from "./common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { Contract } from "./ensureContract";

export const coreModuleDeployedBytecodeSize = size(coreModuleBuild.deployedBytecode.object as Hex);
export const coreModuleBytecode = encodeDeployData({
  bytecode: coreModuleBuild.bytecode.object as Hex,
  abi: [],
});

export const coreModule = (create2Deployer: Address) =>
  getCreate2Address({ from: create2Deployer, bytecode: coreModuleBytecode, salt });

export const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
export const worldFactoryBytecode = (create2Deployer: Address) =>
  encodeDeployData({
    bytecode: worldFactoryBuild.bytecode.object as Hex,
    abi: parseAbi(["constructor(address)"]),
    args: [coreModule(create2Deployer)],
  });

export const worldFactory = (create2Deployer: Address) =>
  getCreate2Address({ from: deployerObj.deployer, bytecode: worldFactoryBytecode(create2Deployer), salt });

export const worldFactoryContracts = (create2Deployer: Address): readonly Contract[] => {
  return [
    {
      bytecode: coreModuleBytecode,
      deployedBytecodeSize: coreModuleDeployedBytecodeSize,
      label: "core module",
    },
    {
      bytecode: worldFactoryBytecode(create2Deployer),
      deployedBytecodeSize: worldFactoryDeployedBytecodeSize,
      label: "world factory",
    },
  ];
};

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>
): Promise<readonly Hex[]> {
  // WorldFactory constructor doesn't call CoreModule, only sets its address, so we can do these in parallel since the address is deterministic
  return await ensureContractsDeployed({
    client,
    contracts: worldFactoryContracts(deployerObj.deployer),
  });
}
