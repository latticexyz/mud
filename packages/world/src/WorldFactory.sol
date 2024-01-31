// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

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
  IModule public immutable coreModule;

  /// @notice Counters to keep track of the number of World instances deployed per address.
  mapping(address creator => uint256 worldCount) public worldCounts;

  /// @param _coreModule The address of the core module.
  constructor(IModule _coreModule) {
    coreModule = _coreModule;
  }

  /**
   * @notice Deploys a new World instance, installs the CoreModule and transfers ownership to the caller.
   * @dev Uses the Create2 for deterministic deployment.
   * @param _salt User defined salt for deterministic world addresses across chains
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld(bytes memory _salt) public returns (address worldAddress) {
    // Deploy a new World and increase the WorldCount
    bytes memory bytecode = type(World).creationCode;
    uint256 salt = uint256(keccak256(abi.encode(msg.sender, _salt)));
    worldCounts[msg.sender]++;

    worldAddress = Create2.deploy(bytecode, salt);
    IBaseWorld world = IBaseWorld(worldAddress);

    // Initialize the World and transfer ownership to the caller
    world.initialize(coreModule);
    world.transferOwnership(ROOT_NAMESPACE_ID, msg.sender);

    emit WorldDeployed(worldAddress);
  }
}
