// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IERC165
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Interface for the ERC-165 standard as described in the EIP-165.
 * Allows for contracts to be checked for their support of an interface.
 * See: https://eips.ethereum.org/EIPS/eip-165
 */
interface IERC165 {
  /**
   * @notice Query if a contract implements an interface.
   * @dev Interface identification is specified in ERC-165.
   * This function uses less than 30,000 gas.
   * @param interfaceID The interface identifier, as specified in ERC-165.
   * @return True if the contract implements `interfaceID` and
   * `interfaceID` is not 0xffffffff, false otherwise.
   */
  function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
