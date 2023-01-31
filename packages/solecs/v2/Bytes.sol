// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Utils } from "./Utils.sol";
import { SchemaType } from "./Types.sol";
import { console } from "forge-std/console.sol";
import { Buffer, Buffer_ } from "./Buffer.sol";
import { Cast } from "./Cast.sol";

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
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 1);
  }

  function from(SchemaType[] memory input) internal pure returns (bytes memory output) {
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 1);
  }

  function from(uint16[] memory input) internal pure returns (bytes memory output) {
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 2);
  }

  function from(uint32[] memory input) internal pure returns (bytes memory output) {
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 4);
  }

  function from(bytes24[] memory input) internal pure returns (bytes memory output) {
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 24, true);
  }

  function from(string memory input) internal pure returns (bytes memory output) {
    assembly {
      output := input
    }
  }

  function from(address[] memory input) internal pure returns (bytes memory output) {
    bytes32 ptr;
    assembly {
      ptr := input
    }

    return _from(ptr, 20);
  }

  function _from(bytes32 _ptr, uint256 _bytesPerElement) internal pure returns (bytes memory output) {
    return _from(_ptr, _bytesPerElement, false);
  }

  function _from(
    bytes32 _ptr,
    uint256 _bytesPerElement,
    bool leftAligned
  ) internal pure returns (bytes memory output) {
    uint256 shiftBits = leftAligned ? 0 : (32 - _bytesPerElement) * 8;

    assembly {
      let inputLength := mload(_ptr)
      let outputBytes := mul(inputLength, _bytesPerElement)

      // Allocate memory for the output and store its length
      output := mload(0x40)
      mstore(output, outputBytes)

      // Update the free memory pointer
      mstore(0x40, add(output, add(32, outputBytes)))

      let outputPtr := add(output, 32)
      for {
        let inputPtr := add(_ptr, 32) // Start at first element
        // Stop at last element
      } lt(inputPtr, add(add(_ptr, 32), mul(mload(_ptr), 32))) {
        inputPtr := add(inputPtr, 32) // Go to next input element
        outputPtr := add(outputPtr, _bytesPerElement) // Go to next output slot
      } {
        mstore(outputPtr, shl(shiftBits, mload(inputPtr))) // Store the value in minimal bytes
      }
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

  /**
   * Converts a tightly packed uint32 array into a regular uint32 array.
   */
  function toUint32Array(bytes memory input) internal pure returns (uint32[] memory output) {
    return Cast.toUint32Array(Buffer_.fromBytes(input).toArray(4));
  }

  /**
   * Converts a tightly packed address array into a regular address array.
   */
  function toAddressArray(bytes memory input) internal pure returns (address[] memory output) {
    return Cast.toAddressArray(Buffer_.fromBytes(input).toArray(20));
  }

  /**
   * Converts a tightly packed bytes24 array into a regular bytes24 array.
   */
  function toBytes24Array(bytes memory input) internal pure returns (bytes24[] memory output) {
    return Cast.toBytes24Array(Buffer_.fromBytes(input).toArray(24, true));
  }

  /************************************************************************
   *
   *    UTILS
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

  /************************************************************************
   *
   *    SET
   *
   ************************************************************************/

  /**
   * Overwrite a single byte of a `bytes32` value and return the new value.
   */
  function setBytes1(
    bytes32 input,
    uint256 index,
    bytes1 overwrite
  ) internal pure returns (bytes32 output) {
    bytes1 mask = 0xff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * Overwrite two bytes of a `bytes32` value and return the new value.
   */
  function setBytes2(
    bytes32 input,
    uint256 index,
    bytes2 overwrite
  ) internal pure returns (bytes32 output) {
    bytes2 mask = 0xffff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xffff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * Overwrite four bytes of a `bytes32` value and return the new value.
   */
  function setBytes4(
    bytes32 input,
    uint256 index,
    bytes4 overwrite
  ) internal pure returns (bytes32 output) {
    bytes4 mask = 0xffffffff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xffffffff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /************************************************************************
   *
   *    SLICE
   *
   ************************************************************************/

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

  /** Slice bytes to bytes1 without copying data */
  function slice1(bytes memory data, uint256 start) internal pure returns (bytes1) {
    bytes1 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  function slice1(bytes32 data, uint256 start) internal pure returns (bytes1) {
    bytes1 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /** Slice bytes to bytes2 without copying data */
  function slice2(bytes memory data, uint256 start) internal pure returns (bytes2) {
    bytes2 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  function slice2(bytes32 data, uint256 start) internal pure returns (bytes2) {
    bytes2 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /** Slice bytes to bytes3 without copying data */
  function slice3(bytes memory data, uint256 start) internal pure returns (bytes3) {
    bytes3 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes4 without copying data */
  function slice4(bytes memory data, uint256 start) internal pure returns (bytes4) {
    bytes4 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  function slice4(bytes32 data, uint256 start) internal pure returns (bytes4) {
    bytes2 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /** Slice bytes to bytes5 without copying data */
  function slice5(bytes memory data, uint256 start) internal pure returns (bytes5) {
    bytes5 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes6 without copying data */
  function slice6(bytes memory data, uint256 start) internal pure returns (bytes6) {
    bytes6 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes7 without copying data */
  function slice7(bytes memory data, uint256 start) internal pure returns (bytes7) {
    bytes7 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes8 without copying data */
  function slice8(bytes memory data, uint256 start) internal pure returns (bytes8) {
    bytes8 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes9 without copying data */
  function slice9(bytes memory data, uint256 start) internal pure returns (bytes9) {
    bytes9 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes10 without copying data */
  function slice10(bytes memory data, uint256 start) internal pure returns (bytes10) {
    bytes10 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes11 without copying data */
  function slice11(bytes memory data, uint256 start) internal pure returns (bytes11) {
    bytes11 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes12 without copying data */
  function slice12(bytes memory data, uint256 start) internal pure returns (bytes12) {
    bytes12 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes13 without copying data */
  function slice13(bytes memory data, uint256 start) internal pure returns (bytes13) {
    bytes13 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes14 without copying data */
  function slice14(bytes memory data, uint256 start) internal pure returns (bytes14) {
    bytes14 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes15 without copying data */
  function slice15(bytes memory data, uint256 start) internal pure returns (bytes15) {
    bytes15 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes16 without copying data */
  function slice16(bytes memory data, uint256 start) internal pure returns (bytes16) {
    bytes16 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes17 without copying data */
  function slice17(bytes memory data, uint256 start) internal pure returns (bytes17) {
    bytes17 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes18 without copying data */
  function slice18(bytes memory data, uint256 start) internal pure returns (bytes18) {
    bytes18 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes19 without copying data */
  function slice19(bytes memory data, uint256 start) internal pure returns (bytes19) {
    bytes19 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes20 without copying data */
  function slice20(bytes memory data, uint256 start) internal pure returns (bytes20) {
    bytes20 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes21 without copying data */
  function slice21(bytes memory data, uint256 start) internal pure returns (bytes21) {
    bytes21 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes22 without copying data */
  function slice22(bytes memory data, uint256 start) internal pure returns (bytes22) {
    bytes22 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes23 without copying data */
  function slice23(bytes memory data, uint256 start) internal pure returns (bytes23) {
    bytes23 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes24 without copying data */
  function slice24(bytes memory data, uint256 start) internal pure returns (bytes24) {
    bytes24 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes25 without copying data */
  function slice25(bytes memory data, uint256 start) internal pure returns (bytes25) {
    bytes25 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes26 without copying data */
  function slice26(bytes memory data, uint256 start) internal pure returns (bytes26) {
    bytes26 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes27 without copying data */
  function slice27(bytes memory data, uint256 start) internal pure returns (bytes27) {
    bytes27 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes28 without copying data */
  function slice28(bytes memory data, uint256 start) internal pure returns (bytes28) {
    bytes28 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes29 without copying data */
  function slice29(bytes memory data, uint256 start) internal pure returns (bytes29) {
    bytes29 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes30 without copying data */
  function slice30(bytes memory data, uint256 start) internal pure returns (bytes30) {
    bytes30 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes31 without copying data */
  function slice31(bytes memory data, uint256 start) internal pure returns (bytes31) {
    bytes31 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /** Slice bytes to bytes32 without copying data */
  function slice32(bytes memory data, uint256 start) internal pure returns (bytes32) {
    bytes32 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
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
