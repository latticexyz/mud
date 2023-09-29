// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @dev Calculation for ERC-165 interface ID for the `supportsInterface` function.
 */
bytes4 constant ERC165_INTERFACE_ID = IERC165.supportsInterface.selector;

/**
 * @title IERC165
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
