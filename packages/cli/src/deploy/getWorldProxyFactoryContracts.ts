import worldProxyFactoryBuild from "@latticexyz/world/out/WorldProxyFactory.sol/WorldProxyFactory.json" assert { type: "json" };
import worldProxyFactoryAbi from "@latticexyz/world/out/WorldProxyFactory.sol/WorldProxyFactory.abi.json" assert { type: "json" };
import { Hex, getCreate2Address, encodeDeployData, size } from "viem";
import { salt } from "./common";
import { getWorldContracts } from "./getWorldContracts";

export function getWorldProxyFactoryContracts(deployerAddress: Hex) {
  const worldContracts = getWorldContracts(deployerAddress);

  const worldProxyFactoryDeployedBytecodeSize = size(worldProxyFactoryBuild.deployedBytecode.object as Hex);
  const worldProxyFactoryBytecode = encodeDeployData({
    bytecode: worldProxyFactoryBuild.bytecode.object as Hex,
    abi: worldProxyFactoryAbi,
    args: [worldContracts.InitModule.address],
  });
  const worldProxyFactory = getCreate2Address({ from: deployerAddress, bytecode: worldProxyFactoryBytecode, salt });

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
