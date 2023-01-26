// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";

library Memory {
  function read(uint256 memoryPointer) internal pure returns (bytes32 data) {
    return read(bytes32(memoryPointer));
  }

  function read(bytes32 memoryPointer) internal pure returns (bytes32 data) {
    assembly {
      data := mload(memoryPointer)
    }
  }

  function read(uint256 memoryPointer, uint256 offset) internal pure returns (bytes32 data) {
    return read(bytes32(memoryPointer), offset);
  }

  function read(bytes32 memoryPointer, uint256 offset) internal pure returns (bytes32 data) {
    assembly {
      data := mload(add(memoryPointer, offset))
    }
  }

  function ptr(bytes memory data) internal pure returns (uint256 memoryPointer) {
    assembly {
      memoryPointer := add(data, 0x20)
    }
  }
}
