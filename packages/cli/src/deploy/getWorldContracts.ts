import accessManagementSystemBuild from "@latticexyz/world/out/AccessManagementSystem.sol/AccessManagementSystem.json" with { type: "json" };
import balanceTransferSystemBuild from "@latticexyz/world/out/BalanceTransferSystem.sol/BalanceTransferSystem.json" with { type: "json" };
import batchCallSystemBuild from "@latticexyz/world/out/BatchCallSystem.sol/BatchCallSystem.json" with { type: "json" };
import registrationSystemBuild from "@latticexyz/world/out/RegistrationSystem.sol/RegistrationSystem.json" with { type: "json" };
import initModuleBuild from "@latticexyz/world/out/InitModule.sol/InitModule.json" with { type: "json" };
import initModuleAbi from "@latticexyz/world/out/InitModule.sol/InitModule.abi.json" with { type: "json" };
import { Hex, encodeDeployData, size } from "viem";
import { getContractAddress } from "@latticexyz/common/internal";

export function getWorldContracts(deployerAddress: Hex) {
  const accessManagementSystemDeployedBytecodeSize = size(accessManagementSystemBuild.deployedBytecode.object as Hex);
  const accessManagementSystemBytecode = accessManagementSystemBuild.bytecode.object as Hex;
  const accessManagementSystem = getContractAddress({
    deployerAddress,
    bytecode: accessManagementSystemBytecode,
  });

  const balanceTransferSystemDeployedBytecodeSize = size(balanceTransferSystemBuild.deployedBytecode.object as Hex);
  const balanceTransferSystemBytecode = balanceTransferSystemBuild.bytecode.object as Hex;
  const balanceTransferSystem = getContractAddress({
    deployerAddress,
    bytecode: balanceTransferSystemBytecode,
  });

  const batchCallSystemDeployedBytecodeSize = size(batchCallSystemBuild.deployedBytecode.object as Hex);
  const batchCallSystemBytecode = batchCallSystemBuild.bytecode.object as Hex;
  const batchCallSystem = getContractAddress({ deployerAddress, bytecode: batchCallSystemBytecode });

  const registrationDeployedBytecodeSize = size(registrationSystemBuild.deployedBytecode.object as Hex);
  const registrationBytecode = registrationSystemBuild.bytecode.object as Hex;
  const registration = getContractAddress({
    deployerAddress,
    bytecode: registrationBytecode,
  });

  const initModuleDeployedBytecodeSize = size(initModuleBuild.deployedBytecode.object as Hex);
  const initModuleBytecode = encodeDeployData({
    bytecode: initModuleBuild.bytecode.object as Hex,
    abi: initModuleAbi,
    args: [accessManagementSystem, balanceTransferSystem, batchCallSystem, registration],
  });
  const initModule = getContractAddress({ deployerAddress, bytecode: initModuleBytecode });

  return {
    AccessManagementSystem: {
      bytecode: accessManagementSystemBytecode,
      deployedBytecodeSize: accessManagementSystemDeployedBytecodeSize,
      debugLabel: "access management system",
      address: accessManagementSystem,
    },
    BalanceTransferSystem: {
      bytecode: balanceTransferSystemBytecode,
      deployedBytecodeSize: balanceTransferSystemDeployedBytecodeSize,
      debugLabel: "balance transfer system",
      address: balanceTransferSystem,
    },
    BatchCallSystem: {
      bytecode: batchCallSystemBytecode,
      deployedBytecodeSize: batchCallSystemDeployedBytecodeSize,
      debugLabel: "batch call system",
      address: batchCallSystem,
    },
    RegistrationSystem: {
      bytecode: registrationBytecode,
      deployedBytecodeSize: registrationDeployedBytecodeSize,
      debugLabel: "core registration system",
      address: registration,
    },
    InitModule: {
      bytecode: initModuleBytecode,
      deployedBytecodeSize: initModuleDeployedBytecodeSize,
      debugLabel: "core module",
      address: initModule,
    },
  };
}
