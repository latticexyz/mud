// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { ASystemThing } from "../../namespaces/a/codegen/systems/ASystemLib.sol";

/**
 * @title IRootSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IRootSystem {
  function setValueInA(ASystemThing memory thing) external;

  function getValueFromA() external view returns (uint256);
}
