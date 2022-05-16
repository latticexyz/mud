pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

library LibUtils {
  function toHex(bytes memory data) internal pure returns (bytes memory res) {
    res = new bytes(data.length * 2);
    bytes memory alphabet = "0123456789abcdef";
    for (uint256 i = 0; i < data.length; i++) {
      res[i * 2 + 0] = alphabet[uint256(uint8(data[i])) >> 4];
      res[i * 2 + 1] = alphabet[uint256(uint8(data[i])) & 15];
    }
  }

  function arrayContains(uint256[] memory arr, uint256 value) internal pure returns (bool) {
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] == value) {
        return true;
      }
    }
    return false;
  }

  function safeDelegateCall(address addr, bytes memory callData) internal returns (bytes memory) {
    (bool success, bytes memory returnData) = addr.delegatecall(callData);
    // if the function call reverted
    if (success == false) {
      // if there is a return reason string
      if (returnData.length > 0) {
        // bubble up any reason for revert
        assembly {
          let returnDataSize := mload(returnData)
          revert(add(32, returnData), returnDataSize)
        }
      } else {
        revert("DelegateCall reverted");
      }
    }
    return returnData;
  }
}
