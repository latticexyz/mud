// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title ISliceErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the Slice library.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding libraries) so they can be inherited by IStore.
 * This ensures that all possible errors are included in the IStore ABI for proper decoding in the frontend.
 */
interface ISliceErrors {
  /**
   * @notice Error raised when the provided slice is out of bounds.
   * @dev Raised if `start` is greater than `end` or `end` greater than the length of `data`.
   * @param data The bytes array to subslice.
   * @param start The start index for the subslice.
   * @param end The end index for the subslice.
   */
  error Slice_OutOfBounds(bytes data, uint256 start, uint256 end);
}
