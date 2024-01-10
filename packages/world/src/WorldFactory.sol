// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Create2 } from "./Create2.sol";
import { World } from "./World.sol";
import { IWorldFactory } from "./IWorldFactory.sol";
import { IBaseWorld } from "./codegen/interfaces/IBaseWorld.sol";
import { IModule } from "./IModule.sol";
import { ROOT_NAMESPACE_ID } from "./constants.sol";

/**
 * @title WorldFactory
 * @notice A factory contract to deploy new World instances.
 * @dev This contract allows users to deploy a new World, install the CoreModule, and transfer the ownership.
 */
contract WorldFactory is IWorldFactory {
  /// @notice Address of the core module to be set in the World instances.
  IModule public coreModule;

  /// @notice Counter to keep track of the number of World instances deployed.
  uint256 public worldCount;

  /// @param _coreModule The address of the core module.
  constructor(IModule _coreModule) {
    coreModule = _coreModule;
  }

  /**
   * @notice Deploys a new World instance, installs the CoreModule and transfers ownership to the caller.
   * @dev Uses the Create2 for deterministic deployment.
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld() public returns (address worldAddress) {
    // Deploy a new World and increase the WorldCount
    bytes memory bytecode = type(World).creationCode;
    worldAddress = Create2.deploy(bytecode, worldCount++);
    IBaseWorld world = IBaseWorld(worldAddress);

    // Initialize the World and transfer ownership to the caller
    world.initialize(coreModule);
    world.transferOwnership(ROOT_NAMESPACE_ID, msg.sender);

    emit WorldDeployed(worldAddress);
  }
}
