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
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice A factory contract to deploy new World instances.
 * @dev This contract allows users to deploy a new World, install the InitModule, and transfer the ownership.
 */
contract WorldFactory is IWorldFactory {
  /// @notice Address of the init module to be set in the World instances.
  IModule public immutable initModule;

  /// @param _initModule The address of the init module.
  constructor(IModule _initModule) {
    initModule = _initModule;
  }

  /**
   * @notice Deploys a new World instance, installs the InitModule and transfers ownership to the caller.
   * @dev Uses the Create2 for deterministic deployment.
   * @param salt User defined salt for deterministic world addresses across chains
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld(bytes memory salt) public returns (address worldAddress) {
    // Deploy a new World and increase the WorldCount
    bytes memory bytecode = type(World).creationCode;
    uint256 _salt = uint256(keccak256(abi.encode(msg.sender, salt)));
    worldAddress = Create2.deploy(bytecode, _salt);
    IBaseWorld world = IBaseWorld(worldAddress);

    // Initialize the World and transfer ownership to the caller
    world.initialize(initModule);

    emit WorldDeployed(worldAddress, _salt);
  }

  /**
   * @notice register module function selectors
   * @dev This function breaks down the tasks in the installRoot function. Can work well with zkEVM.
   * @param worldAddress The address of the newly deployed World contract
   */
  function registerModuleFunctions(address worldAddress) public {
    IBaseWorld world = IBaseWorld(worldAddress);
    // Initialize the World and transfer ownership to the caller
    world.registerModuleFunction();
    world.transferOwnership(ROOT_NAMESPACE_ID, msg.sender);
  }
}
