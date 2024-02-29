// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title ISliceErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the Slice library.
 */
interface ISliceErrors {
  error Slice_OutOfBounds(bytes data, uint256 start, uint256 end);
}
