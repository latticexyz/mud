// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { SliceLib } from "./Slice.sol";

library Bytes {
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

  /**
   * In-place set the length of a `bytes` memory value.
   */
  function setLength(bytes memory input, uint256 length) internal pure returns (bytes memory) {
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
  function setBytes1(bytes32 input, uint256 index, bytes1 overwrite) internal pure returns (bytes32 output) {
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
  function setBytes2(bytes32 input, uint256 index, bytes2 overwrite) internal pure returns (bytes32 output) {
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
  function setBytes4(bytes32 input, uint256 index, bytes4 overwrite) internal pure returns (bytes32 output) {
    bytes4 mask = 0xffffffff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xffffffff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * In-place overwrite a four bytes of a `bytes memory` value.
   */
  function setBytes4(bytes memory input, uint256 offset, bytes4 overwrite) internal pure returns (bytes memory) {
    bytes4 mask = 0xffffffff;
    assembly {
      let value := mload(add(add(input, 0x20), offset))
      value := and(value, not(mask)) // zero out the first 4 bytes
      value := or(value, overwrite) // set the bytes at the offset
      mstore(add(add(input, 0x20), offset), value) // store the new value
    }
    return input;
  }

  /************************************************************************
   *
   *    SLICE
   *
   ************************************************************************/

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
}
