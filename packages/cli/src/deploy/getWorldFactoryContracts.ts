import worldFactoryBuild from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.json" assert { type: "json" };
import worldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { Hex, getCreate2Address, encodeDeployData, size } from "viem";
import { salt } from "./common";
import { getWorldContracts } from "./getWorldContracts";

export function getWorldFactoryContracts(deployerAddress: Hex) {
  const worldContracts = getWorldContracts(deployerAddress);

  const worldFactoryDeployedBytecodeSize = size(worldFactoryBuild.deployedBytecode.object as Hex);
  const worldFactoryBytecode = encodeDeployData({
    bytecode: worldFactoryBuild.bytecode.object as Hex,
    abi: worldFactoryAbi,
    args: [worldContracts.InitModule.address],
  });
  const worldFactory = getCreate2Address({ from: deployerAddress, bytecode: worldFactoryBytecode, salt });

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
