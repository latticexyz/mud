// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { ERC165_INTERFACE_ID } from "./interfaces/IERC165.sol";
import { IWorldContextConsumer, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "./interfaces/IWorldContextConsumer.sol";

// The context size is 20 bytes for msg.sender, and 32 bytes for msg.value
uint256 constant CONTEXT_BYTES = 20 + 32;

// Similar to https://eips.ethereum.org/EIPS/eip-2771, but any contract can be the trusted forwarder.
// This should only be used for contracts without own storage, like Systems.
abstract contract WorldContextConsumer is IWorldContextConsumer {
  // Extract the trusted msg.sender value appended to the calldata
  function _msgSender() public view returns (address sender) {
    assembly {
      // Load 32 bytes from calldata at position calldatasize() - context size,
      // then shift left 96 bits (to right-align the address)
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), CONTEXT_BYTES)))
    }
    if (sender == address(0)) sender = msg.sender;
  }

  // Extract the trusted msg.value value appended to the calldata
  function _msgValue() public pure returns (uint256 value) {
    assembly {
      // Load 32 bytes from calldata at position calldatasize() - 32 bytes,
      value := calldataload(sub(calldatasize(), 32))
    }
  }

  function _world() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  // ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
  function supportsInterface(bytes4 interfaceId) public pure virtual returns (bool) {
    return interfaceId == WORLD_CONTEXT_CONSUMER_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}

/**
 * Simple utility function to call a contract and append the msg.sender to the calldata (to be consumed by WorldContextConsumer)
 */
library WorldContextProvider {
  function appendContext(
    bytes memory callData,
    address msgSender,
    uint256 msgValue
  ) internal pure returns (bytes memory) {
    return abi.encodePacked(callData, msgSender, msgValue);
  }

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
