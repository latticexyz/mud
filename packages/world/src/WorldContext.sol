// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { revertWithBytes } from "./revertWithBytes.sol";

// Similar to https://eips.ethereum.org/EIPS/eip-2771, but any contract can be the trusted forwarder.
// This should only be used for contracts without own storage, like Systems.
abstract contract WorldContextConsumer {
  // Extract the trusted msg.sender value appended to the calldata
  function _msgSender() internal view returns (address sender) {
    assembly {
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), 20)))
    }
    if (sender == address(0)) sender = msg.sender;
  }

  function _world() internal view returns (address) {
    return StoreSwitch.getStoreAddress();
  }
}

/**
 * Simple utility function to call a contract and append the msg.sender to the calldata (to be consumed by WorldContextConsumer)
 */
library WorldContextProvider {
  function appendContext(bytes memory funcSelectorAndArgs, address msgSender) internal pure returns (bytes memory) {
    return abi.encodePacked(funcSelectorAndArgs, msgSender);
  }

  function callWithContext(
    address target,
    bytes memory funcSelectorAndArgs,
    address msgSender,
    uint256 value
  ) internal returns (bool success, bytes memory data) {
    (success, data) = target.call{ value: value }(appendContext(funcSelectorAndArgs, msgSender));
  }

  function delegatecallWithContext(
    address target,
    bytes memory funcSelectorAndArgs,
    address msgSender
  ) internal returns (bool success, bytes memory data) {
    (success, data) = target.delegatecall(appendContext(funcSelectorAndArgs, msgSender));
  }

  function callWithContextOrRevert(
    address target,
    bytes memory funcSelectorAndArgs,
    address msgSender,
    uint256 value
  ) internal returns (bytes memory data) {
    (bool success, bytes memory _data) = callWithContext(target, funcSelectorAndArgs, msgSender, value);
    if (!success) revertWithBytes(_data);
    return _data;
  }

  function delegatecallWithContextOrRevert(
    address target,
    bytes memory funcSelectorAndArgs,
    address msgSender
  ) internal returns (bytes memory data) {
    (bool success, bytes memory _data) = delegatecallWithContext(target, funcSelectorAndArgs, msgSender);
    if (!success) revertWithBytes(_data);
    return _data;
  }
}
