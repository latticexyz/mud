// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IEncodedLengthsErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the EncodedLengths library.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding libraries) so they can be inherited by IStore.
 * This ensures that all possible errors are included in the IStore ABI for proper decoding in the frontend.
 */
interface IEncodedLengthsErrors {
  /**
   * @notice Error raised when the provided encoded lengths has an invalid length.
   * @param length The length of the encoded lengths.
   */
  error EncodedLengths_InvalidLength(uint256 length);
}
