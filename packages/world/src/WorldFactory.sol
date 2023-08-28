// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { World } from "./World.sol";
import { IWorldFactory } from "./interfaces/IWorldFactory.sol";
import { IBaseWorld } from "./interfaces/IBaseWorld.sol";
import { IModule } from "./interfaces/IModule.sol";

contract WorldFactory is IWorldFactory {
  IModule public coreModule;
  uint256 public worldCount;

  constructor(IModule _coreModule) {
    coreModule = _coreModule;
  }

  function deployWorld() public {
    address newContractAddress;
    bytes memory bytecode = type(World).creationCode;
    bytes32 salt = bytes32(worldCount);
    assembly {
      newContractAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    }
    IBaseWorld world = IBaseWorld(newContractAddress);
    world.installRootModule(coreModule, new bytes(0));
    emit WorldDeployed(newContractAddress);
    worldCount++;
  }
}
