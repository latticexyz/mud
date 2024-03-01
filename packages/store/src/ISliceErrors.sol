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
  error Slice_OutOfBounds(bytes data, uint256 start, uint256 end);
}
