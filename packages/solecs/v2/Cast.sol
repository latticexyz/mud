// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Cast {
  function toUint32Array(uint256 ptr) internal pure returns (uint32[] memory arr) {
    assembly {
      arr := ptr
    }
  }

  function toUint256Array(uint256 ptr) internal pure returns (uint256[] memory arr) {
    assembly {
      arr := ptr
    }
  }

  function toBytes24Array(uint256 ptr) internal pure returns (bytes24[] memory arr) {
    assembly {
      arr := ptr
    }
  }
}
