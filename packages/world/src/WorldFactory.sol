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

  function create2Deploy(bytes memory byteCode, uint256 salt) internal returns (address addr) {
    assembly {
      addr := create2(0, add(byteCode, 0x20), mload(byteCode), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
  }

  function deployContract(bytes memory byteCode, uint256 salt) public {
    address addr = create2Deploy(byteCode, salt);
    emit ContractDeployed(addr, salt);
  }

  function deployWorld() public {
    bytes memory bytecode = type(World).creationCode;
    address worldAddress = create2Deploy(bytecode, worldCount);
    IBaseWorld world = IBaseWorld(worldAddress);
    world.installRootModule(coreModule, new bytes(0));
    emit WorldDeployed(worldAddress);
    worldCount++;
  }
}
