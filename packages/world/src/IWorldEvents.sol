// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldErrors } from "./IWorldErrors.sol";
import { IModule } from "./IModule.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @title IWorldEvents
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */
interface IWorldEvents {
  /**
   * @dev Emitted upon successful World initialization.
   * @param worldVersion The version of the World being initialized.
   */
  event HelloWorld(bytes32 indexed worldVersion);
}
