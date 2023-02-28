// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Utils {
  function divCeil(uint256 a, uint256 b) internal pure returns (uint256) {
    return a / b + (a % b == 0 ? 0 : 1);
  }

  /**
   * Adapted from https://github.com/dk1a/solidity-stringutils/blob/main/src/utils/mem.sol#L149-L167
   * @dev Left-aligned byte mask (e.g. for partial mload/mstore).
   * For byteLength >= 32 returns type(uint256).max
   *
   * length 0:   0x000000...000000
   * length 1:   0xff0000...000000
   * length 2:   0xffff00...000000
   * ...
   * length 30:  0xffffff...ff0000
   * length 31:  0xffffff...ffff00
   * length 32+: 0xffffff...ffffff
   */
  function leftMask(uint256 byteLength) internal pure returns (uint256) {
    unchecked {
      return ~(type(uint256).max >> (byteLength * 8));
    }
  }
}
