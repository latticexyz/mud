import accessManagementSystemBuild from "@latticexyz/world/out/AccessManagementSystem.sol/AccessManagementSystem.json" assert { type: "json" };
import balanceTransferSystemBuild from "@latticexyz/world/out/BalanceTransferSystem.sol/BalanceTransferSystem.json" assert { type: "json" };
import batchCallSystemBuild from "@latticexyz/world/out/BatchCallSystem.sol/BatchCallSystem.json" assert { type: "json" };
import coreRegistrationSystemBuild from "@latticexyz/world/out/CoreRegistrationSystem.sol/CoreRegistrationSystem.json" assert { type: "json" };
import coreModuleBuild from "@latticexyz/world/out/CoreModule.sol/CoreModule.json" assert { type: "json" };
import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Hex, parseAbi, getCreate2Address, encodeDeployData, size } from "viem";
import { deployer } from "./ensureDeployer";
import { salt } from "./common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { Contract } from "./ensureContract";

export const accessManagementSystemDeployedBytecodeSize = size(
  accessManagementSystemBuild.deployedBytecode.object as Hex
);
export const accessManagementSystemBytecode = encodeDeployData({
  bytecode: accessManagementSystemBuild.bytecode.object as Hex,
  abi: [],
});
export const accessManagementSystem = getCreate2Address({
  from: deployer,
  bytecode: accessManagementSystemBytecode,
  salt,
});

export const balanceTransferSystemDeployedBytecodeSize = size(
  balanceTransferSystemBuild.deployedBytecode.object as Hex
);
export const balanceTransferSystemBytecode = encodeDeployData({
  bytecode: balanceTransferSystemBuild.bytecode.object as Hex,
  abi: [],
});
export const balanceTransferSystem = getCreate2Address({
  from: deployer,
  bytecode: balanceTransferSystemBytecode,
  salt,
});

export const batchCallSystemDeployedBytecodeSize = size(batchCallSystemBuild.deployedBytecode.object as Hex);
export const batchCallSystemBytecode = encodeDeployData({
  bytecode: batchCallSystemBuild.bytecode.object as Hex,
  abi: [],
});
export const batchCallSystem = getCreate2Address({ from: deployer, bytecode: batchCallSystemBytecode, salt });

export const coreRegistrationSystemDeployedBytecodeSize = size(
  coreRegistrationSystemBuild.deployedBytecode.object as Hex
);
export const coreRegistrationSystemBytecode = encodeDeployData({
  bytecode: coreRegistrationSystemBuild.bytecode.object as Hex,
  abi: [],
});
export const coreRegistrationSystem = getCreate2Address({
  from: deployer,
  bytecode: coreRegistrationSystemBytecode,
  salt,
});

export const coreModuleDeployedBytecodeSize = size(coreModuleBuild.deployedBytecode.object as Hex);
export const coreModuleBytecode = encodeDeployData({
  bytecode: coreModuleBuild.bytecode.object as Hex,
  abi: parseAbi(["constructor(address,address,address,address)"]),
  args: [accessManagementSystem, balanceTransferSystem, batchCallSystem, coreRegistrationSystem],
});

export const coreModule = getCreate2Address({ from: deployer, bytecode: coreModuleBytecode, salt });

export const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
export const worldFactoryBytecode = encodeDeployData({
  bytecode: worldFactoryBuild.bytecode.object as Hex,
  abi: parseAbi(["constructor(address)"]),
  args: [coreModule],
});

export const worldFactory = getCreate2Address({ from: deployer, bytecode: worldFactoryBytecode, salt });

export const worldFactoryContracts: readonly Contract[] = [
  {
    bytecode: accessManagementSystemBytecode,
    deployedBytecodeSize: accessManagementSystemDeployedBytecodeSize,
    label: "access management system",
  },
  {
    bytecode: balanceTransferSystemBytecode,
    deployedBytecodeSize: balanceTransferSystemDeployedBytecodeSize,
    label: "balance transfer system",
  },
  {
    bytecode: batchCallSystemBytecode,
    deployedBytecodeSize: batchCallSystemDeployedBytecodeSize,
    label: "batch call system",
  },
  {
    bytecode: coreRegistrationSystemBytecode,
    deployedBytecodeSize: coreRegistrationSystemDeployedBytecodeSize,
    label: "core registration system",
  },
  {
    bytecode: coreModuleBytecode,
    deployedBytecodeSize: coreModuleDeployedBytecodeSize,
    label: "core module",
  },
  {
    bytecode: worldFactoryBytecode,
    deployedBytecodeSize: worldFactoryDeployedBytecodeSize,
    label: "world factory",
  },
];

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>
): Promise<readonly Hex[]> {
  // WorldFactory constructor doesn't call CoreModule, only sets its address, so we can do these in parallel since the address is deterministic
  return await ensureContractsDeployed({
    client,
    contracts: worldFactoryContracts,
  });
}
