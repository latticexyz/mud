// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StorageCoder } from "./StorageCoder.sol";
import { Slice } from "../Slice.sol";
import { SchemaType } from "../Types.sol";

library DecodeSlice {
  /************************************************************************
   *
   *    Slice -> bytes1-32
   *
   ************************************************************************/

  function toBytes4(Slice self) internal pure returns (bytes4 output) {
    return bytes4(self.toBytes32());
  }

  // `toBytes32` is already defined in `Slice_`

  /************************************************************************
   *
   *    Slice -> uint8-256
   *
   ************************************************************************/

  function toUint8(Slice self) internal pure returns (uint8 output) {
    return uint8(bytes1(self.toBytes32()));
  }

  function toUint32(Slice self) internal pure returns (uint32 output) {
    return uint32(bytes4(self.toBytes32()));
  }

  function toUint256(Slice self) internal pure returns (uint256 output) {
    return uint256(bytes32(self.toBytes32()));
  }

  /************************************************************************
   *
   *    Slice -> misc types
   *
   ************************************************************************/

  function toAddress(Slice self) internal pure returns (address output) {
    return address(bytes20(self.toBytes32()));
  }

  /************************************************************************
   *
   *    Slice -> array of bytes1-32
   *
   ************************************************************************/

  function toBytes24Array(Slice self) internal pure returns (bytes24[] memory output) {
    bytes32[] memory genericArray = StorageCoder.decode(self, 24, true);
    assembly {
      output := genericArray
    }
  }

  function toBytes32Array(Slice self) internal pure returns (bytes32[] memory output) {
    bytes32[] memory genericArray = StorageCoder.decode(self, 32, true);
    assembly {
      output := genericArray
    }
  }

  /************************************************************************
   *
   *    Slice -> array of uint8-256
   *
   ************************************************************************/

  function toUint32Array(Slice self) internal pure returns (uint32[] memory output) {
    bytes32[] memory genericArray = StorageCoder.decode(self, 4, false);
    assembly {
      output := genericArray
    }
  }

  /************************************************************************
   *
   *    Slice -> misc array types
   *
   ************************************************************************/

  function toSchemaTypeArray(Slice self) internal pure returns (SchemaType[] memory output) {
    bytes32[] memory genericArray = StorageCoder.decode(self, 1, false);
    assembly {
      output := genericArray
    }
  }

  function toAddressArray(Slice self) internal pure returns (address[] memory output) {
    // Note: internally address is right-aligned, like uint160
    bytes32[] memory genericArray = StorageCoder.decode(self, 20, false);
    assembly {
      output := genericArray
    }
  }
}
