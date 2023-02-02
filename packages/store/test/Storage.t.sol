// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Cast } from "../src/Cast.sol";
import { Storage } from "../src/Storage.sol";
import { Utils } from "../src/Utils.sol";
import { Bytes } from "../src/Bytes.sol";

contract StorageTest is Test {
  function testStoreLoad() public {
    bytes memory data1 = bytes.concat(
      bytes1(0x01),
      bytes32(0x0200000000000000000000000000000000000000000000000000000000000003),
      bytes1(0x04)
    );

    bytes memory originalDataFirstSlot = bytes.concat(
      bytes32(0x42000000000000000000000000000000000000000000000000000000000069FF)
    );
    bytes memory originalDataLastSlot = bytes.concat(
      bytes32(0xFF42000000000000000000000000000000000000000000000000000000000069)
    );

    uint256 storagePointer = uint256(keccak256("some location"));
    uint256 storagePointerTwoSlotsAfter = storagePointer + 2;

    // First store some data to storage at the target slot and two slots after the target slot

    // !gasreport store 1 storage slot
    Storage.store({ storagePointer: storagePointer, data: originalDataFirstSlot });

    Storage.store({ storagePointer: storagePointerTwoSlotsAfter, data: originalDataLastSlot });

    // Then set the target slot, partially overwriting the first and third slot, but using safeTrail and offset

    // !gasreport store 34 bytes over 3 storage slots (with offset and safeTrail))
    Storage.store({ storagePointer: storagePointer, offset: 31, data: data1 });

    // Assert the first slot has the correct value
    assertEq(
      Storage.load({ storagePointer: storagePointer }),
      bytes32(0x4200000000000000000000000000000000000000000000000000000000006901)
    );

    // Assert the second slot has the correct value
    assertEq(
      Storage.load({ storagePointer: storagePointer + 1 }),
      bytes32(0x0200000000000000000000000000000000000000000000000000000000000003)
    );

    // Assert that the trailing slot has the correct value
    assertEq(
      Storage.load({ storagePointer: storagePointerTwoSlotsAfter }),
      bytes32(0x0442000000000000000000000000000000000000000000000000000000000069)
    );

    // Assert we can load the correct partial value from storage

    // !gasreport load 34 bytes over 3 storage slots (with offset and safeTrail))
    bytes memory data = Storage.load({ storagePointer: storagePointer, length: 34, offset: 31 });

    assertEq(Bytes.slice1(data, 0), bytes1(0x01));
    assertEq(Bytes.slice32(data, 1), bytes32(0x0200000000000000000000000000000000000000000000000000000000000003));
    assertEq(Bytes.slice1(data, 33), bytes1(0x04));
    assertEq(keccak256(data), keccak256(data1));
  }

  function testStoreLoadFuzzy(
    bytes memory data,
    bytes32 storagePointer,
    uint8 offset
  ) public {
    Storage.store({ storagePointer: uint256(storagePointer), offset: offset, data: data });
    assertEq(
      keccak256(Storage.load({ storagePointer: uint256(storagePointer), length: data.length, offset: offset })),
      keccak256(data)
    );
  }
}
