// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IPackedCounterErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the PackedCounter library.
 */
interface IPackedCounterErrors {
  error PackedCounter_InvalidLength(uint256 length);
}
