// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Cast } from "../Cast.sol";
import { Storage } from "../Storage.sol";
import { Utils } from "../Utils.sol";
import { Bytes } from "../Bytes.sol";

contract StorageTest is DSTestPlus {
  function testWriteRead() public {
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

    // First write some data to storage at the target slot and two slots after the target slot
    uint256 gas = gasleft();
    Storage.write(storagePointer, originalDataFirstSlot);
    gas = gas - gasleft();
    console.log("gas used (write, %s slots): %s", Utils.divCeil(originalDataFirstSlot.length, 32), gas);

    gas = gasleft();
    Storage.write(storagePointerTwoSlotsAfter, originalDataLastSlot);
    gas = gas - gasleft();
    console.log("gas used (write, %s slots): %s", Utils.divCeil(originalDataLastSlot.length, 32), gas);

    // Then set the target slot, partially overwriting the first and third slot, but using safeTrail and offset
    gas = gasleft();
    Storage.write(storagePointer, 31, data1);
    gas = gas - gasleft();
    console.log("gas used (write, %s slots): %s", Utils.divCeil(data1.length + 31, 32), gas);

    // Assert the first slot has the correct value
    assertEq(Storage.read(storagePointer), bytes32(0x4200000000000000000000000000000000000000000000000000000000006901));

    // Assert the second slot has the correct value
    assertEq(
      Storage.read(storagePointer + 1),
      bytes32(0x0200000000000000000000000000000000000000000000000000000000000003)
    );

    // Assert that the trailing slot has the correct value
    assertEq(
      Storage.read(storagePointerTwoSlotsAfter),
      bytes32(0x0442000000000000000000000000000000000000000000000000000000000069)
    );

    // Assert we can read the correct partial value from storage
    gas = gasleft();
    bytes memory data = Storage.read(storagePointer, 31, 34);
    gas = gas - gasleft();
    console.log("gas used (read, %s slots (warm)): %s", Utils.divCeil(data.length + 31, 32), gas);
    assertEq(Bytes.slice1(data, 0), bytes1(0x01));
    assertEq(Bytes.slice32(data, 1), bytes32(0x0200000000000000000000000000000000000000000000000000000000000003));
    assertEq(Bytes.slice1(data, 33), bytes1(0x04));
    assertEq(keccak256(data), keccak256(data1));
  }

  function testWriteReadFuzzy(
    bytes memory data,
    bytes32 storagePointer,
    uint8 offset
  ) public {
    Storage.write(storagePointer, offset, data);
    assertEq(keccak256(Storage.read(storagePointer, offset, data.length)), keccak256(data));
  }
}
