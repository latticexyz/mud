// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { ERC165_INTERFACE_ID } from "./IERC165.sol";
import { IWorldContextConsumer, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "./IWorldContextConsumer.sol";

// The context size is 20 bytes for msg.sender, and 32 bytes for msg.value
uint256 constant CONTEXT_BYTES = 20 + 32;

/**
 * @title WorldContextConsumer - Extracting trusted context values from appended calldata.
 * @notice This contract is designed to extract trusted context values (like msg.sender and msg.value)
 * from the appended calldata. It provides mechanisms similar to EIP-2771 (https://eips.ethereum.org/EIPS/eip-2771),
 * but allowing any contract to be the trusted forwarder.
 * @dev This contract should only be used for contracts without their own storage, like Systems.
 */
abstract contract WorldContextConsumer is IWorldContextConsumer {
  /**
   * @notice Extract the `msg.sender` from the context appended to the calldata.
   * @return sender The `msg.sender` in the call to the World contract before the World routed the
   * call to the WorldContextConsumer contract.
   */
  function _msgSender() public view returns (address sender) {
    return WorldContextConsumerLib._msgSender();
  }

  /**
   * @notice Extract the `msg.value` from the context appended to the calldata.
   * @return value The `msg.value` in the call to the World contract before the World routed the
   * call to the WorldContextConsumer contract.
   */
  function _msgValue() public pure returns (uint256 value) {
    return WorldContextConsumerLib._msgValue();
  }

  /**
   * @notice Get the address of the World contract that routed the call to this WorldContextConsumer.
   * @return The address of the World contract that routed the call to this WorldContextConsumer.
   */
  function _world() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  /**
   * @notice Checks if an interface is supported by the contract.
   * using ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
   * @param interfaceId The ID of the interface in question.
   * @return True if the interface is supported, false otherwise.
   */
  function supportsInterface(bytes4 interfaceId) public pure virtual returns (bool) {
    return interfaceId == WORLD_CONTEXT_CONSUMER_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}

library WorldContextConsumerLib {
  /**
   * @notice Extract the `msg.sender` from the context appended to the calldata.
   * @return sender The `msg.sender` in the call to the World contract before the World routed the
   * call to the WorldContextConsumer contract.
   */
  function _msgSender() internal view returns (address sender) {
    assembly {
      // Load 32 bytes from calldata at position calldatasize() - context size,
      // then shift left 96 bits (to right-align the address)
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), CONTEXT_BYTES)))
    }
    if (sender == address(0)) sender = msg.sender;
  }

  /**
   * @notice Extract the `msg.value` from the context appended to the calldata.
   * @return value The `msg.value` in the call to the World contract before the World routed the
   * call to the WorldContextConsumer contract.
   */
  function _msgValue() internal pure returns (uint256 value) {
    assembly {
      // Load 32 bytes from calldata at position calldatasize() - 32 bytes,
      value := calldataload(sub(calldatasize(), 32))
    }
  }

  /**
   * @notice Get the address of the World contract that routed the call to this WorldContextConsumer.
   * @return The address of the World contract that routed the call to this WorldContextConsumer.
   */
  function _world() internal view returns (address) {
    return StoreSwitch.getStoreAddress();
  }
}

/**
 * @title WorldContextProviderLib - Utility functions to call contracts with context values appended to calldata.
 * @notice This library provides functions to make calls or delegatecalls to other contracts,
 * appending the context values (like msg.sender and msg.value) to the calldata for WorldContextConsumer to consume.
 */
library WorldContextProviderLib {
  /**
   * @notice Appends context values to the given calldata.
   * @param callData The original calldata.
   * @param msgSender The address of the transaction sender.
   * @param msgValue The amount of ether sent with the original transaction.
   * @return The new calldata with context values appended.
   */
  function appendContext(
    bytes memory callData,
    address msgSender,
    uint256 msgValue
  ) internal pure returns (bytes memory) {
    return abi.encodePacked(callData, msgSender, msgValue);
  }

  /**
   * @notice Makes a call to the target contract with context values appended to the calldata.
   * @param msgSender The address of the transaction sender.
   * @param msgValue The amount of ether sent with the original transaction.
   * @param target The address of the contract to call.
   * @param callData The calldata for the call.
   * @return success A boolean indicating whether the call was successful or not.
   * @return data The abi encoded return data from the call.
   */
  function callWithContext(
    address msgSender,
    uint256 msgValue,
    address target,
    bytes memory callData
  ) internal returns (bool success, bytes memory data) {
    (success, data) = target.call{ value: 0 }(
      appendContext({ callData: callData, msgSender: msgSender, msgValue: msgValue })
    );
  }

  /**
   * @notice Makes a delegatecall to the target contract with context values appended to the calldata.
   * @param msgSender The address of the transaction sender.
   * @param msgValue The amount of ether sent with the original transaction.
   * @param target The address of the contract to call.
   * @param callData The calldata for the call.
   * @return success A boolean indicating whether the call was successful or not.
   * @return data The abi encoded return data from the call.
   */
  function delegatecallWithContext(
    address msgSender,
    uint256 msgValue,
    address target,
    bytes memory callData
  ) internal returns (bool success, bytes memory data) {
    (success, data) = target.delegatecall(
      appendContext({ callData: callData, msgSender: msgSender, msgValue: msgValue })
    );
  }

  /**
   * @notice Makes a call to the target contract with context values appended to the calldata.
   * @dev Revert in the case of failure.
   * @param msgSender The address of the transaction sender.
   * @param msgValue The amount of ether sent with the original transaction.
   * @param target The address of the contract to call.
   * @param callData The calldata for the call.
   * @return data The abi encoded return data from the call.
   */
  function callWithContextOrRevert(
    address msgSender,
    uint256 msgValue,
    address target,
    bytes memory callData
  ) internal returns (bytes memory data) {
    (bool success, bytes memory _data) = callWithContext({
      msgSender: msgSender,
      msgValue: msgValue,
      target: target,
      callData: callData
    });
    if (!success) revertWithBytes(_data);
    return _data;
  }

  /**
   * @notice Makes a delegatecall to the target contract with context values appended to the calldata.
   * @dev Revert in the case of failure.
   * @param msgSender The address of the transaction sender.
   * @param msgValue The amount of ether sent with the original transaction.
   * @param target The address of the contract to call.
   * @param callData The calldata for the call.
   * @return data The abi encoded return data from the call.
   */
  function delegatecallWithContextOrRevert(
    address msgSender,
    uint256 msgValue,
    address target,
    bytes memory callData
  ) internal returns (bytes memory data) {
    (bool success, bytes memory _data) = delegatecallWithContext({
      msgSender: msgSender,
      msgValue: msgValue,
      target: target,
      callData: callData
    });
    if (!success) revertWithBytes(_data);
    return _data;
  }
}
