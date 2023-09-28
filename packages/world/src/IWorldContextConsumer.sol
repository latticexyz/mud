// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";

/**
 * @dev World Context Consumer Interface
 * This interface defines the functions a contract needs to consume the world context.
 * It includes helper functions to retrieve the message sender, value, and world address.
 * Additionally, it integrates with the ERC-165 standard for interface detection.
 */

bytes4 constant WORLD_CONTEXT_CONSUMER_INTERFACE_ID = IWorldContextConsumer._msgSender.selector ^
  IWorldContextConsumer._msgValue.selector ^
  IWorldContextConsumer._world.selector ^
  ERC165_INTERFACE_ID;

/**
 * @title WorldContextConsumer - Extracting trusted context values from appended calldata.
 * @notice This contract is designed to extract trusted context values (like msg.sender and msg.value)
 * from the appended calldata. It provides mechanisms similar to EIP-2771 (https://eips.ethereum.org/EIPS/eip-2771),
 * allowing any contract to be the trusted forwarder.
 * @dev This contract should only be used for contracts without their own storage, like Systems.
 */
interface IWorldContextConsumer is IERC165 {
  /**
   * @notice Get the original `msg.sender` of the transaction.
   * @dev This function allows the retrieval of the original caller even after context changes.
   * @return The address of the original transaction initiator.
   */
  function _msgSender() external view returns (address);

  /**
   * @notice Get the original `msg.value` of the transaction.
   * @dev This function allows the retrieval of the original transaction value even after context changes.
   * @return The value of the original transaction.
   */
  function _msgValue() external view returns (uint256);

  /**
   * @notice Get the world's address.
   * @dev This function returns the address of the world contract.
   * @return The address of the world contract.
   */
  function _world() external view returns (address);
}
