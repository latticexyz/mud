import worldProxyFactoryBuild from "@latticexyz/world/out/WorldProxyFactory.sol/WorldProxyFactory.json" with { type: "json" };
import worldProxyFactoryAbi from "@latticexyz/world/out/WorldProxyFactory.sol/WorldProxyFactory.abi.json" with { type: "json" };
import { Hex, encodeDeployData, size } from "viem";
import { getWorldContracts } from "./getWorldContracts";
import { getContractAddress } from "@latticexyz/common/internal";

export function getWorldProxyFactoryContracts(deployerAddress: Hex) {
  const worldContracts = getWorldContracts(deployerAddress);

  const worldProxyFactoryDeployedBytecodeSize = size(worldProxyFactoryBuild.deployedBytecode.object as Hex);
  const worldProxyFactoryBytecode = encodeDeployData({
    bytecode: worldProxyFactoryBuild.bytecode.object as Hex,
    abi: worldProxyFactoryAbi,
    args: [worldContracts.InitModule.address],
  });
  const worldProxyFactory = getContractAddress({ deployerAddress, bytecode: worldProxyFactoryBytecode });

  return {
    ...worldContracts,
    WorldProxyFactory: {
      bytecode: worldProxyFactoryBytecode,
      deployedBytecodeSize: worldProxyFactoryDeployedBytecodeSize,
      debugLabel: "world proxy factory",
      address: worldProxyFactory,
    },
  };
}
