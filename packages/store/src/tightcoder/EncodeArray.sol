// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "../Types.sol";
import { TightCoder } from "./TightCoder.sol";

library EncodeArray {
  /**
   * Converts a `bytes` memory array to a single `bytes` memory value.
   * TODO: optimize gas cost
   */
  function encode(bytes[] memory input) internal pure returns (bytes memory output) {
    output = new bytes(0);
    for (uint256 i; i < input.length; i++) {
      output = bytes.concat(output, input[i]);
    }
  }

  function encode(uint8[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 1, false);
  }

  function encode(SchemaType[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 1, false);
  }

  function encode(uint16[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 2, false);
  }

  function encode(uint32[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 4, false);
  }

  function encode(bytes24[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 24, true);
  }

  function encode(address[] memory input) internal pure returns (bytes memory output) {
    bytes32[] memory _genericArray;
    assembly {
      _genericArray := input
    }

    return TightCoder.encode(_genericArray, 20, false);
  }
}
