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
 * but allowing any contract to be the trusted forwarder.
 * @dev This contract should only be used for contracts without their own storage, like Systems.
 */
interface IWorldContextConsumer is IERC165 {
  /**
   * @notice Extract the `msg.sender` from the context appended to the calldata.
   * @return The address of the `msg.sender` that called the World contract
   * before the World routed the call to the WorldContextConsumer contract.
   */
  function _msgSender() external view returns (address);

  /**
   * @notice Extract the `msg.value` from the context appended to the calldata.
   * @return The `msg.value` in the call to the World contract before the World routed the
   * call to the WorldContextConsumer contract.
   */
  function _msgValue() external view returns (uint256);

  /**
   * @notice Get the address of the World contract that routed the call to this WorldContextConsumer.
   * @return The address of the World contract that routed the call to this WorldContextConsumer.
   */
  function _world() external view returns (address);
}
