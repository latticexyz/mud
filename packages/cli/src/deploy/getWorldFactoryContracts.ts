import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" with { type: "json" };
import worldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" with { type: "json" };
import { Hex, encodeDeployData, size } from "viem";
import { getWorldContracts } from "./getWorldContracts";
import { getContractAddress } from "@latticexyz/common/internal";

export function getWorldFactoryContracts(deployerAddress: Hex) {
  const worldContracts = getWorldContracts(deployerAddress);

  const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
  const worldFactoryBytecode = encodeDeployData({
    bytecode: worldFactoryBuild.bytecode.object as Hex,
    abi: worldFactoryAbi,
    args: [worldContracts.InitModule.address],
  });
  const worldFactory = getContractAddress({ deployerAddress, bytecode: worldFactoryBytecode });

  return {
    ...worldContracts,
    WorldFactory: {
      bytecode: worldFactoryBytecode,
      deployedBytecodeSize: worldFactoryDeployedBytecodeSize,
      debugLabel: "world factory",
      address: worldFactory,
    },
  };
}
