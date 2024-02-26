import accessManagementSystemBuild from "@latticexyz/world/out/AccessManagementSystem.sol/AccessManagementSystem.json" assert { type: "json" };
import balanceTransferSystemBuild from "@latticexyz/world/out/BalanceTransferSystem.sol/BalanceTransferSystem.json" assert { type: "json" };
import batchCallSystemBuild from "@latticexyz/world/out/BatchCallSystem.sol/BatchCallSystem.json" assert { type: "json" };
import registrationSystemBuild from "@latticexyz/world/out/RegistrationSystem.sol/RegistrationSystem.json" assert { type: "json" };
import initModuleBuild from "@latticexyz/world/out/InitModule.sol/InitModule.json" assert { type: "json" };
import initModuleAbi from "@latticexyz/world/out/InitModule.sol/InitModule.abi.json" assert { type: "json" };
import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import worldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Hex, getCreate2Address, encodeDeployData, size, Abi } from "viem";
import { deployer } from "./ensureDeployer";
import { salt } from "./common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { Contract } from "./ensureContract";

export const accessManagementSystemDeployedBytecodeSize = size(
  accessManagementSystemBuild.deployedBytecode.object as Hex,
);
export const accessManagementSystemBytecode = encodeDeployData({
  bytecode: accessManagementSystemBuild.bytecode.object as Hex,
  abi: [] as Abi,
});
export const accessManagementSystem = getCreate2Address({
  from: deployer,
  bytecode: accessManagementSystemBytecode,
  salt,
});

export const balanceTransferSystemDeployedBytecodeSize = size(
  balanceTransferSystemBuild.deployedBytecode.object as Hex,
);
export const balanceTransferSystemBytecode = encodeDeployData({
  bytecode: balanceTransferSystemBuild.bytecode.object as Hex,
  abi: [] as Abi,
});
export const balanceTransferSystem = getCreate2Address({
  from: deployer,
  bytecode: balanceTransferSystemBytecode,
  salt,
});

export const batchCallSystemDeployedBytecodeSize = size(batchCallSystemBuild.deployedBytecode.object as Hex);
export const batchCallSystemBytecode = encodeDeployData({
  bytecode: batchCallSystemBuild.bytecode.object as Hex,
  abi: [] as Abi,
});
export const batchCallSystem = getCreate2Address({ from: deployer, bytecode: batchCallSystemBytecode, salt });

export const registrationDeployedBytecodeSize = size(registrationSystemBuild.deployedBytecode.object as Hex);
export const registrationBytecode = encodeDeployData({
  bytecode: registrationSystemBuild.bytecode.object as Hex,
  abi: [] as Abi,
});
export const registration = getCreate2Address({
  from: deployer,
  bytecode: registrationBytecode,
  salt,
});

export const initModuleDeployedBytecodeSize = size(initModuleBuild.deployedBytecode.object as Hex);
export const initModuleBytecode = encodeDeployData({
  bytecode: initModuleBuild.bytecode.object as Hex,
  abi: initModuleAbi,
  args: [accessManagementSystem, balanceTransferSystem, batchCallSystem, registration],
});

export const initModule = getCreate2Address({ from: deployer, bytecode: initModuleBytecode, salt });

export const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
export const worldFactoryBytecode = encodeDeployData({
  bytecode: worldFactoryBuild.bytecode.object as Hex,
  abi: worldFactoryAbi,
  args: [initModule],
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
    bytecode: registrationBytecode,
    deployedBytecodeSize: registrationDeployedBytecodeSize,
    label: "core registration system",
  },
  {
    bytecode: initModuleBytecode,
    deployedBytecodeSize: initModuleDeployedBytecodeSize,
    label: "core module",
  },
  {
    bytecode: worldFactoryBytecode,
    deployedBytecodeSize: worldFactoryDeployedBytecodeSize,
    label: "world factory",
  },
];

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>,
): Promise<readonly Hex[]> {
  // WorldFactory constructor doesn't call InitModule, only sets its address, so we can do these in parallel since the address is deterministic
  return await ensureContractsDeployed({
    client,
    contracts: worldFactoryContracts,
  });
}
