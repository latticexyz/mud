// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

// Similar to https://eips.ethereum.org/EIPS/eip-2771, but any contract can be the trusted forwarder.
// This should only be used for contracts without own storage, like Systems.
abstract contract WorldContext {
  // Extract the trusted msg.sender value appended to the calldata
  function _msgSender() internal view returns (address sender) {
    assembly {
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), 20)))
    }
    if (sender == address(0)) sender = msg.sender;
  }

  function _world() internal view returns (address) {
    return StoreSwitch.isDelegateCall() ? address(this) : msg.sender;
  }
}
