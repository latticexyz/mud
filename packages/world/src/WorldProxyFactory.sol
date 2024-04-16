// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Create2 } from "./Create2.sol";
import { World } from "./World.sol";
import { IWorldFactory } from "./IWorldFactory.sol";
import { IBaseWorld } from "./codegen/interfaces/IBaseWorld.sol";
import { IModule } from "./IModule.sol";
import { ROOT_NAMESPACE_ID } from "./constants.sol";
import { WorldProxy } from "./WorldProxy.sol";

/**
 * @title WorldProxyFactory
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice A factory contract to deploy new WorldProxy instances.
 * @dev This contract allows users to deploy a new World and WorldProxy, install the InitModule, and transfer the ownership.
 */
contract WorldProxyFactory is IWorldFactory {
  /// @notice Address of the init module to be set in the World instances.
  IModule public immutable initModule;
  address public immutable worldImplementation;

  /// @param _initModule The address of the init module.
  constructor(IModule _initModule) {
    initModule = _initModule;

    // Deploy a world implementation
    worldImplementation = address(new World());
  }

  /**
   * @notice Deploys a new World and WorldProxy instance, installs the InitModule and transfers ownership to the caller.
   * @dev Uses the Create2 for deterministic deployment.
   * @param salt User defined salt for deterministic world addresses across chains
   * @return worldAddress The address of the newly deployed WorldProxy contract.
   */
  function deployWorld(bytes memory salt) public returns (address worldAddress) {
    // Deploy a new World and increase the WorldCount
    uint256 _salt = uint256(keccak256(abi.encode(msg.sender, salt)));

    // Deploy the world proxy
    bytes memory worldProxyBytecode = abi.encodePacked(type(WorldProxy).creationCode, abi.encode(worldImplementation));
    worldAddress = Create2.deploy(worldProxyBytecode, _salt);

    IBaseWorld world = IBaseWorld(worldAddress);

    // Initialize the World and transfer ownership to the caller
    world.initialize(initModule);
    world.transferOwnership(ROOT_NAMESPACE_ID, msg.sender);

    emit WorldDeployed(worldAddress, _salt);
  }
}
