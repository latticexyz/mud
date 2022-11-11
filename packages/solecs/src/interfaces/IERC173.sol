// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

/**
 * @title ERC-173 Contract ownership standard
 * @dev see https://eips.ethereum.org/EIPS/eip-173
 */
interface IERC173 {
  /** @dev This emits when ownership of a contract changes. */
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @notice Get the address of the owner
   * @return The address of the owner.
   */
  function owner() external view returns (address);

  /**
   * @notice Set the address of the new owner of the contract
   * @dev Set _newOwner to address(0) to renounce any ownership.
   * @param _newOwner The address of the new owner of the contract
   */
  function transferOwnership(address _newOwner) external;
}
