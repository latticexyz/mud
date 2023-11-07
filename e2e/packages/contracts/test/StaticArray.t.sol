// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { PackedCounterLib } from "@latticexyz/store/src/PackedCounter.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { StaticArray, StaticArrayTableId } from "../src/codegen/index.sol";

contract StaticArrayTest is MudTest {
  uint256 internal memoryCorruptionCheck = uint256(keccak256("memoryCorruptionCheck"));

  function testMemoryCorruption() public {
    uint256[] memory data = new uint256[](3);
    data[0] = 1;
    data[1] = 2;
    data[2] = memoryCorruptionCheck;

    StoreSwitch.setRecord(
      StaticArrayTableId,
      new bytes32[](0),
      "",
      PackedCounterLib.pack(3),
      abi.encodePacked(EncodeArray.encode(data))
    );

    uint256[2] memory result = StaticArray.get();
    assertEq(result[0], 0);
    assertEq(result[1], 0);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x40))
      mstore(0x40, add(mload(0x40), 0x20))
    }
    assertNotEq(memoryAfterResult, memoryCorruptionCheck);
  }
}
