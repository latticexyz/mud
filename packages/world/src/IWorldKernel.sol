// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldErrors } from "./IWorldErrors.sol";
import { IModule } from "./IModule.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @title World Module Installation Interface
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface defines the contract responsible for managing root modules installation.
 */
interface IWorldModuleInstallation {
  /**
   * @notice Install the given root module in the World.
   * @dev Requires the caller to own the root namespace. The module is delegatecalled and installed in the root namespace.
   * @param module The module to be installed.
   * @param encodedArgs The ABI encoded arguments for the module installation.
   */
  function installRootModule(IModule module, bytes memory encodedArgs) external;

  /**
   * @notice Register module function selectors.
   * @dev Requires the caller to own the root namespace. The module is delegatecalled and installed in the root namespace.
   */
  function registerModuleFunction() external;
}

/**
 * @title World Call Interface
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface defines the contract for executing calls on the World's systems.
 */
interface IWorldCall {
  /**
   * @notice Call the system at the given system ID.
   * @dev If the system is not public, the caller must have access to the namespace or name (encoded in the system ID).
   * @param systemId The ID of the system to be called.
   * @param callData The data to pass with the call,
   * function selector (4 bytes) followed by the ABI encoded parameters.
   * @return The abi encoded return data from the called system.
   */
  function call(ResourceId systemId, bytes memory callData) external payable returns (bytes memory);

  /**
   * @notice Call the system at the given system ID on behalf of the given delegator.
   * @dev If the system is not public, the delegator must have access to the namespace or name (encoded in the system ID).
   * @param delegator The address on whose behalf the call is made.
   * @param systemId The ID of the system to be called.
   * @param callData The data to pass with the call,
   * function selector (4 bytes) followed by the ABI encoded parameters.
   * @return The abi encoded return data from the called system.
   */
  function callFrom(
    address delegator,
    ResourceId systemId,
    bytes memory callData
  ) external payable returns (bytes memory);
}

/**
 * @title World Kernel Interface
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice The IWorldKernel interface includes all methods that are part of the World contract's
 * internal bytecode. Consumers should use the `IBaseWorld` interface instead, which includes dynamically
 * registered functions selectors from the `InitModule`.
 */
interface IWorldKernel is IWorldModuleInstallation, IWorldCall, IWorldErrors {
  /**
   * @dev Emitted upon successful World initialization.
   * @param worldVersion The version of the World being initialized.
   */
  event HelloWorld(bytes32 indexed worldVersion);

  /**
   * @notice Retrieve the version of the World.
   * @return The version identifier of the World.
   */
  function worldVersion() external view returns (bytes32);

  /**
   * @notice Retrieve the immutable original deployer of the World.
   * @return The address of the World's creator.
   */
  function creator() external view returns (address);

  /**
   * @notice Initializes the World.
   * @dev Can only be called once by the creator.
   * @param initModule The InitModule to be installed during initialization.
   */
  function initialize(IModule initModule) external;
}
