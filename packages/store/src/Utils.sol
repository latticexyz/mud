// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Utils {
  function divCeil(uint256 a, uint256 b) internal pure returns (uint256) {
    return a / b + (a % b == 0 ? 0 : 1);
  }

  /**
   * Adapted from https://github.com/dk1a/solidity-stringutils/blob/main/src/utils/mem.sol#L149-L167
   * @dev Left-aligned bit mask (e.g. for partial mload/mstore).
   * For length >= 32 returns type(uint256).max
   */
  function leftMask(uint256 bitLength) internal pure returns (uint256) {
    unchecked {
      return ~(type(uint256).max >> (bitLength));
    }
  }
}
