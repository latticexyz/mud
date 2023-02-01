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

  // Needs unique name to avoid conflict with `from(uint32)`
  function fromUint8(uint8 input) internal pure returns (bytes memory output) {
    return bytes.concat(bytes1(input));
  }

  function from(uint32 input) internal pure returns (bytes memory output) {
    return bytes.concat(bytes4(input));
  }

  function from(address input) internal pure returns (bytes memory output) {
    return bytes.concat(bytes20(input));
  }

  function from(bytes4 input) internal pure returns (bytes memory output) {
    return bytes.concat(input);
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

  function toBytes32(bytes memory input) internal pure returns (bytes32 output) {
    return bytes32(input);
  }

  function toUint256(bytes memory input) internal pure returns (uint256 output) {
    return uint256(bytes32(input));
  }

  function toUint32(bytes memory input) internal pure returns (uint32 output) {
    return uint32(bytes4(input));
  }

  function toAddress(bytes memory input) internal pure returns (address output) {
    return address(bytes20(input));
  }

  function toBytes4(bytes memory input) internal pure returns (bytes4 output) {
    return bytes4(input);
  }

  function toUint8(bytes memory input) internal pure returns (uint8 output) {
    return uint8(input[0]);
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

  // From https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol
  function slice(
    bytes memory _bytes,
    uint256 _start,
    uint256 _length
  ) internal pure returns (bytes memory) {
    require(_length + 31 >= _length, "slice_overflow");
    require(_bytes.length >= _start + _length, "slice_outOfBounds");

    bytes memory tempBytes;

    assembly {
      switch iszero(_length)
      case 0 {
        // Get a location of some free memory and store it in tempBytes as
        // Solidity does for memory variables.
        tempBytes := mload(0x40)

        // The first word of the slice result is potentially a partial
        // word read from the original array. To read it, we calculate
        // the length of that partial word and start copying that many
        // bytes into the array. The first word we copy will start with
        // data we don't care about, but the last `lengthmod` bytes will
        // land at the beginning of the contents of the new array. When
        // we're done copying, we overwrite the full first word with
        // the actual length of the slice.
        let lengthmod := and(_length, 31)

        // The multiplication in the next line is necessary
        // because when slicing multiples of 32 bytes (lengthmod == 0)
        // the following copy loop was copying the origin's length
        // and then ending prematurely not copying everything it should.
        let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
        let end := add(mc, _length)

        for {
          // The multiplication in the next line has the same exact purpose
          // as the one above.
          let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
        } lt(mc, end) {
          mc := add(mc, 0x20)
          cc := add(cc, 0x20)
        } {
          mstore(mc, mload(cc))
        }

        mstore(tempBytes, _length)

        //update free-memory pointer
        //allocating the array padded to 32 bytes like the compiler does now
        mstore(0x40, and(add(mc, 31), not(31)))
      }
      //if we want a zero-length slice let's just return a zero-length array
      default {
        tempBytes := mload(0x40)
        //zero out the 32 bytes slice we are about to return
        //we need to do it because Solidity does not garbage collect
        mstore(tempBytes, 0)

        mstore(0x40, add(tempBytes, 0x20))
      }
    }

    return tempBytes;
  }

  /**
   * Splits a `bytes` memory array into a `bytes` memory array of the given lengths.
   */
  function split(bytes memory data, uint256[] memory lengths) internal pure returns (bytes[] memory chunks) {
    chunks = new bytes[](lengths.length);
    uint256 sum;
    for (uint256 i = 0; i < lengths.length; ) {
      chunks[i] = slice(data, sum, lengths[i]);
      unchecked {
        sum += lengths[i];
        i += 1;
      }
    }
    return chunks;
  }
}
