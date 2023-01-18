// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Utils } from "./Utils.sol";
import { SchemaType } from "./Types.sol";

library Bytes {
  error Bytes_InputTooShort();

  /************************************************************************
   *
   *    ANYTHING -> BYTES
   *
   ************************************************************************/

  /**
   * Converts a `bytes` memory array to a single `bytes` memory value.
   * TODO: optimize gas cost
   */
  function from(bytes[] memory input) internal pure returns (bytes memory output) {
    output = new bytes(0);
    for (uint256 i; i < input.length; i++) {
      output = bytes.concat(output, input[i]);
    }
  }

  function from(uint8[] memory input) internal pure returns (bytes memory output) {
    output = new bytes(input.length);
    for (uint256 i; i < input.length; i++) {
      output[i] = bytes1(input[i]);
    }
  }

  function from(SchemaType[] memory input) internal pure returns (bytes memory output) {
    output = new bytes(input.length);
    for (uint256 i; i < input.length; i++) {
      output[i] = bytes1(uint8(input[i]));
    }
  }

  function from(uint32 input) internal pure returns (bytes memory output) {
    return bytes.concat(bytes4(input));
  }

  /************************************************************************
   *
   *    BYTES -> ANYTHING
   *
   ************************************************************************/

  /**
   * Converts a `bytes` memory blob to a single `bytes32` memory value, starting at the given byte offset.
   */
  function toBytes32(bytes memory input, uint256 offset) internal pure returns (bytes32 output) {
    assembly {
      // input is a pointer to the start of the bytes array
      // in memory, the first 32 bytes are the length of the array
      // so we add 32 to the pointer to get to the start of the data
      // then we add the start offset to get to the start of the desired word
      output := mload(add(input, add(0x20, offset)))
    }
  }

  /**
   * Converts a `bytes` memory blob to a single `bytes32` memory value.
   */
  function toBytes32(bytes memory input) internal pure returns (bytes32 output) {
    return bytes32(input);
  }

  /**
   * Converts a `bytes` memory blob to a single `uint256` memory value.
   */
  function toUint256(bytes memory input) internal pure returns (uint256 output) {
    return uint256(bytes32(input));
  }

  function toUint32(bytes memory input) internal pure returns (uint32 output) {
    return uint32(bytes4(input));
  }

  /**
   * Converts a `bytes` memory blob to a `bytes32` memory array.
   */
  function toBytes32Array(bytes memory input) internal pure returns (bytes32[] memory output) {
    output = new bytes32[](Utils.divCeil(input.length, 32));
    for (uint256 i = 0; i < output.length; i++) {
      output[i] = toBytes32(input, i * 32);
    }
    return output;
  }

  /**
   * Converts a `bytes` memory blob to a `SchemaType` memory array.
   */
  function toSchemaTypeArray(bytes memory input) internal pure returns (SchemaType[] memory output) {
    output = new SchemaType[](input.length);
    for (uint256 i = 0; i < output.length; i++) {
      output[i] = SchemaType(uint8(input[i]));
    }
    return output;
  }

  /************************************************************************
   *
   *    BYTES UTILS
   *
   ************************************************************************/

  function equals(bytes memory a, bytes memory b) internal pure returns (bool) {
    if (a.length != b.length) {
      return false;
    }
    return keccak256(a) == keccak256(b);
  }

  function setLengthInPlace(bytes memory input, uint256 length) internal pure returns (bytes memory) {
    assembly {
      mstore(input, length)
    }
    return input;
  }

  /**
   * Splits a `bytes` memory array into a `bytes` memory array of the given lengths.
   * TODO: optimize gas cost
   */
  function split(bytes memory data, uint256[] memory lengths) internal pure returns (bytes[] memory) {
    bytes[] memory chunks = new bytes[](lengths.length);
    uint256 sum = 0;
    for (uint256 i = 0; i < lengths.length; ) {
      chunks[i] = new bytes(lengths[i]);
      for (uint256 j = 0; j < lengths[i]; ) {
        unchecked {
          chunks[i][j] = data[sum + j];
          j += 1;
        }
      }
      unchecked {
        sum += lengths[i];
        i += 1;
      }
    }
    return chunks;
  }
}
