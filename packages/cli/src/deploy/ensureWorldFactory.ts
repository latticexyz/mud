import accessManagementSystemBuild from "@latticexyz/world/out/AccessManagementSystem.sol/AccessManagementSystem.json" assert { type: "json" };
import balanceTransferSystemBuild from "@latticexyz/world/out/BalanceTransferSystem.sol/BalanceTransferSystem.json" assert { type: "json" };
import batchCallSystemBuild from "@latticexyz/world/out/BatchCallSystem.sol/BatchCallSystem.json" assert { type: "json" };
import registrationSystemBuild from "@latticexyz/world/out/RegistrationSystem.sol/RegistrationSystem.json" assert { type: "json" };
import initModuleBuild from "@latticexyz/world/out/InitModule.sol/InitModule.json" assert { type: "json" };
import initModuleAbi from "@latticexyz/world/out/InitModule.sol/InitModule.abi.json" assert { type: "json" };
import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import worldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { Client, Transport, Chain, Account, Hex, getCreate2Address, encodeDeployData, size, Address } from "viem";
import { salt } from "./common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { Contract } from "./ensureContract";

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>,
  deployerAddress: Hex,
): Promise<Address> {
  const accessManagementSystemDeployedBytecodeSize = size(accessManagementSystemBuild.deployedBytecode.object as Hex);
  const accessManagementSystemBytecode = accessManagementSystemBuild.bytecode.object as Hex;
  const accessManagementSystem = getCreate2Address({
    from: deployerAddress,
    bytecode: accessManagementSystemBytecode,
    salt,
  });

  const balanceTransferSystemDeployedBytecodeSize = size(balanceTransferSystemBuild.deployedBytecode.object as Hex);
  const balanceTransferSystemBytecode = balanceTransferSystemBuild.bytecode.object as Hex;
  const balanceTransferSystem = getCreate2Address({
    from: deployerAddress,
    bytecode: balanceTransferSystemBytecode,
    salt,
  });

  const batchCallSystemDeployedBytecodeSize = size(batchCallSystemBuild.deployedBytecode.object as Hex);
  const batchCallSystemBytecode = batchCallSystemBuild.bytecode.object as Hex;
  const batchCallSystem = getCreate2Address({ from: deployerAddress, bytecode: batchCallSystemBytecode, salt });

  const registrationDeployedBytecodeSize = size(registrationSystemBuild.deployedBytecode.object as Hex);
  const registrationBytecode = registrationSystemBuild.bytecode.object as Hex;
  const registration = getCreate2Address({
    from: deployerAddress,
    bytecode: registrationBytecode,
    salt,
  });

  const initModuleDeployedBytecodeSize = size(initModuleBuild.deployedBytecode.object as Hex);
  const initModuleBytecode = encodeDeployData({
    bytecode: initModuleBuild.bytecode.object as Hex,
    abi: initModuleAbi,
    args: [accessManagementSystem, balanceTransferSystem, batchCallSystem, registration],
  });

  const initModule = getCreate2Address({ from: deployerAddress, bytecode: initModuleBytecode, salt });

  const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
  const worldFactoryBytecode = encodeDeployData({
    bytecode: worldFactoryBuild.bytecode.object as Hex,
    abi: worldFactoryAbi,
    args: [initModule],
  });

  const worldFactory = getCreate2Address({ from: deployerAddress, bytecode: worldFactoryBytecode, salt });

  const worldFactoryContracts: readonly Contract[] = [
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

  // WorldFactory constructor doesn't call InitModule, only sets its address, so we can do these in parallel since the address is deterministic
  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: worldFactoryContracts,
  });

  return worldFactory;
}
