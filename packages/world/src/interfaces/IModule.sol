// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorldCore } from "./IWorldCore.sol";

interface IModule {
  error RequiredModuleNotFound(string resourceSelector);

  /**
   * Return the module name as a bytes16.
   */
  function getName() external view returns (bytes16 name);

  /**
   * A module expects to be called via the World contract, and therefore installs itself on its `msg.sender`.
   */
  function install(bytes memory args) external;
}
