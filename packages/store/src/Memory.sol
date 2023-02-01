// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";

library Memory {
  function load(uint256 memoryPointer) internal pure returns (bytes32 data) {
    return load(bytes32(memoryPointer));
  }

  function load(bytes32 memoryPointer) internal pure returns (bytes32 data) {
    assembly {
      data := mload(memoryPointer)
    }
  }

  function load(uint256 memoryPointer, uint256 offset) internal pure returns (bytes32 data) {
    return load(bytes32(memoryPointer), offset);
  }

  function load(bytes32 memoryPointer, uint256 offset) internal pure returns (bytes32 data) {
    assembly {
      data := mload(add(memoryPointer, offset))
    }
  }

  function dataPointer(bytes memory data) internal pure returns (uint256 memoryPointer) {
    assembly {
      memoryPointer := add(data, 0x20)
    }
  }

  function lengthPointer(bytes memory data) internal pure returns (uint256 memoryPointer) {
    assembly {
      memoryPointer := data
    }
  }
}
